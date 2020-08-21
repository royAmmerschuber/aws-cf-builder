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
interface DependencyNode{
    pos:number
    node:depKey
    movable:boolean
    dependencies:Set<DependencyNode>
    referenceRoots:Set<DependencyNode>
    references:Set<types.Node>
}
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
const placeholder=Symbol()
type placeholder=typeof placeholder
function transform(source:types.SourceFile){
    const dependencyTreeRoots=new Set<DependencyNode>()
    const allDepNodes=new Map<depKey,DependencyNode|placeholder>()
    //*read dependency tree
    const handleRefs=(node:depKey,root=false):DependencyNode=>{
        const existent=allDepNodes.get(node)
        if(existent==placeholder){
            //TODO recursive
            throw new Error("recursive")
        }else if(existent){
            if(!root) dependencyTreeRoots.delete(existent)
            return existent
        }else if(check.isReferenceFindableNode(node)){
            allDepNodes.set(node,placeholder)
            const references=node.findReferencesAsNodes()
                .filter(r=>r.getSourceFile()==source) //only in current file
                .filter(r=>r.getParent()!=node) //filter out declaration referencing itself for some reason
            const referenceRoots=references
                .map(getTopParent)
                .map(r=>handleRefs(r))
            const dep:DependencyNode={
                pos:node.getPos(),
                node,
                movable: (
                    check.isVariableDeclaration(node) &&
                    node.getVariableStatement().getDeclarationKind()==types.VariableDeclarationKind.Const &&
                    referenceRoots.every(r=>r.movable)
                ),
                dependencies:new Set(),
                references:new Set(references),
                referenceRoots:new Set(referenceRoots)
            }
            referenceRoots.forEach(r=>r.dependencies.add(dep))
            allDepNodes.set(node,dep)
            if(root) dependencyTreeRoots.add(dep)
            return dep
        }else{
            const dep:DependencyNode={
                pos:node.getPos(),
                node,
                movable:false,
                dependencies:new Set(),
                referenceRoots:new Set(),
                references:new Set()
            }
            allDepNodes.set(node,dep)
            if(root) dependencyTreeRoots.add(dep)
            return dep
        }
    }
    const handleNamespaceRefs=(node:types.NamespaceDeclaration)=>{
        //TODO handle namespace scoping
        node.getStatements().forEach(stmt=>{
            if(check.isNamespaceDeclaration(stmt)){
                handleNamespaceRefs(stmt)
            }else if(check.isVariableStatement(stmt)){
                stmt.getDeclarations().forEach(dec=>{
                    handleRefs(dec,true)
                })
            }else if(check.isReferenceFindableNode(stmt)){
                handleRefs(stmt,true)
            }
        })
    }
    source.getStatements().forEach(stmt=>{
        if(check.isNamespaceDeclaration(stmt)){
            handleNamespaceRefs(stmt)
        }else if(check.isVariableStatement(stmt)){
            stmt.getDeclarations().forEach(dec=>{
                handleRefs(dec,true)
            })
        }else if(check.isReferenceFindableNode(stmt)){
            handleRefs(stmt,true)
        }
    })
    //*write const list
    let insertPos=0
    const reorder=(stmt:types.VariableDeclaration)=>{
        const name=getUniqueIdentifier(source,stmt.getName())
        source.insertVariableStatement(insertPos,{
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
    return source.compilerNode
}
const project=new Project({
    tsConfigFilePath:require.resolve("./testFiles/tsconfig.json")
})
const file=project.getSourceFileOrThrow("testConstHoisting.cf.ts")
transform(file)
console.log(file.getFullText())