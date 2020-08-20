import { Project, ts, Node as check} from "ts-morph"
import * as types from "ts-morph"
/*
TODO namespaces
TODO functions
if(const used before declaration && doesnt depend on non consts){
 if(first use before last dependency) {
     run over last dependency
     if(dependency not movable){
         throw
     }
 }
   move before first use && after last dependency
}

*/
type depKey=types.Statement|types.VariableDeclaration
const isConstDecl=(stmt:types.Node):stmt is types.VariableDeclaration=>check.isVariableDeclaration(stmt) && stmt.getVariableStatement().getDeclarationKind()==types.VariableDeclarationKind.Const
const getTopParent=(ref: types.Node):depKey=> ref.getParentWhile(p=>!(
    check.isSourceFile(p) ||
    check.isNamespaceDeclaration(p) ||
    check.isVariableDeclarationList(p)
)) as any
function getUniqueIdentifier(source:types.SourceFile,base:string){
    const {identifiers}:{identifiers:Map<string,string>}=source.compilerNode as any
    let name=`${base}_1`
    for(let i=1;identifiers.has(name);i++){
        name=`${base}_${i}`
    }
    return name
}
function transform(source:types.SourceFile){
    const s=source
    const dependencyMap=new Map<depKey,{
        dependencies:Set<depKey>
        references:Set<depKey>
    }>()
    const getOrInitDep=(key:depKey)=>{
        if(dependencyMap.has(key)) return dependencyMap.get(key)
        const dep={
            dependencies:new Set<depKey>(),
            references:new Set<depKey>()
        }
        dependencyMap.set(key,dep)
        return dep
    }
    //*read dependency tree
    const handleRefs=(node:depKey&types.ReferenceFindableNode)=>{
        const nodeDep=getOrInitDep(node)
        node.findReferencesAsNodes()
            .filter(ref=>ref.getSourceFile()==s)
            .map(getTopParent)
            .filter(ref=>ref!=node)
            .forEach(stmt=>{
                nodeDep.references.add(stmt)
                const refDep=getOrInitDep(stmt as any)
                refDep.dependencies.add(node as any)
            })
    }
    const handleNamespaceRefs=(node:types.NamespaceDeclaration)=>{
        node.getStatements().forEach(stmt=>{
            if(check.isNamespaceDeclaration(stmt)){
                handleNamespaceRefs(stmt)
            }else if(check.isVariableStatement(stmt)){
                stmt.getDeclarations().forEach(dec=>{
                    handleRefs(dec)
                })
            }else if(check.isReferenceFindableNode(stmt)){
                handleRefs(stmt)
            }
        })
    }
    s.getStatements().forEach(stmt=>{
        if(check.isNamespaceDeclaration(stmt)){
            handleNamespaceRefs(stmt)
        }else if(check.isVariableStatement(stmt)){
            stmt.getDeclarations().forEach(dec=>{
                handleRefs(dec)
            })
        }else if(check.isReferenceFindableNode(stmt)){
            handleRefs(stmt)
        }
    })
    //*write const list
    let insertPos=0
    const reorder=(stmt:types.VariableDeclaration)=>{
        const name=getUniqueIdentifier(s,stmt.getName())
        s.insertVariableStatement(insertPos,{
            declarations:[ {
                name,
                initializer:stmt.getInitializer().getText(),
                type:stmt.getTypeNode()?.getText(),
            } ],
            declarationKind:types.VariableDeclarationKind.Const
        })
        insertPos++
        stmt.setInitializer(name)
        stmt.findReferencesAsNodes()
            .filter(ref=>ref!=stmt.getNameNode())
            .forEach((r:types.Node)=>{
                r.replaceWithText(name)
            })
    }
    const done=new WeakSet()

    const handleDep=(stmt:depKey)=>{
        const isDone=done.has(stmt)
        done.add(stmt)

        if(isConstDecl(stmt)){
            if(isDone){
                return
            }
            const {references,dependencies}=dependencyMap.get(stmt)
            let depsLet=false
            dependencies.forEach(dep=>{
                if(!isConstDecl(dep)) depsLet=true
                handleDep(dep)
            })
            let refdBefore=false
            const stmtPos=stmt.getPos()
            references.forEach(ref=>{
                if(ref.getPos()<stmtPos) refdBefore=true
            })
            if(!depsLet && refdBefore){
                reorder(stmt)
            }
        }else if(!isDone){
            dependencyMap.get(stmt)?.dependencies
                .forEach(s=>handleDep(s))
        }
    }
    dependencyMap
        .forEach((_o,stmt)=>handleDep(stmt))
    return s.compilerNode
}
const project=new Project({
    tsConfigFilePath:require.resolve("./testFiles/tsconfig.json")
})
const file=project.getSourceFileOrThrow("testConstHoisting.cf.ts")
transform(file)
console.log(file.getFullText())