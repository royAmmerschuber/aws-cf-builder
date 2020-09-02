import { Project, ts, Node as check } from "ts-morph"
import * as types from "ts-morph"
import {promises as fs} from "fs"
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
interface Namespace{
    name:string
    statements:Set<DependencyNode>
    subspaces:Set<Namespace>
    pos:number
    end:number
    namespace?:Namespace
}
interface DependencyNode{
    pos:number
    node:depKey
    nonConst:boolean
    movable:boolean
    dependencies:Set<DependencyNode>
    referenceRoots:Set<DependencyNode>
    references:Set<types.Node>
    namespace?:Namespace    
}
const isConstDecl=(stmt:types.Node):stmt is types.VariableDeclaration=>check.isVariableDeclaration(stmt) && stmt.getVariableStatement().getDeclarationKind()==types.VariableDeclarationKind.Const
const getTopParent=(ref: types.Node):depKey=> ref.getParentWhile(p=>!(
    check.isSourceFile(p) ||
    check.isNamespaceDeclaration(p) ||
    check.isVariableDeclarationList(p)
)) as any
function getUniqueIdentifier(used:(Set<string>|Map<string,any>)[],base:string){
    let name=`${base}_1`
    for(let i=1;used.some(v=>v.has(name));i++){
        name=`${base}_${i}`
    }
    return name
}
const placeholder=Symbol()
type placeholder=typeof placeholder
let depth=0
function transform(source:types.SourceFile){
    const newSource:(string|types.StatementStructures)[]=[]
    const done=new WeakMap<any,boolean>()
    function insert(stmt:DependencyNode){
        if(check.isVariableDeclaration(stmt.node)){
            newSource.push({
                ...stmt.node
                    .getParent()
                    .getParentIfKindOrThrow(types.SyntaxKind.VariableStatement)
                    .getStructure(),
                declarations:[
                    stmt.node.getStructure()
                ]
            } as types.VariableStatementStructure)
            stmt.node.getStructure()
        }else{
            newSource.push(stmt.node.getText())
        }
        console.log(`${"||||".repeat(depth--)}-------------------------------`)
    }
    function handleDep(stmt:DependencyNode){
        //@ts-ignore
        console.log(`${"||||".repeat(++depth)} deps:${stmt.dependencies.size} const:${!stmt.nonConst} mov:${stmt.movable} text: ${stmt.node?.getText()}`)
        if(!done.has(stmt)){
            if(stmt.namespace){
                handleNS(stmt)
            }else if(!stmt.movable){
                done.set(stmt,false)
                const nonConstDependencies=[...stmt.dependencies.values()]
                    .filter(v=>v.nonConst)
                    .filter(v=>!done.has(v))
                stmt.dependencies
                    .forEach(handleDep)
                const immovableSiblings=nonConstDependencies
                    .flatMap(v=>[...v.referenceRoots.values()]
                        .filter(v=>!v.movable))
                    .filter(unique())
                    .sort((a,b)=>a.pos-b.pos)
                if(immovableSiblings.length){
                    immovableSiblings.forEach(s=>{
                        if(s==stmt){
                            insert(s)
                            done.set(s,true)
                        }else{
                            handleDep(s)
                        }
                    })
                }else{
                    insert(stmt)
                    done.set(stmt,true)
                }
            }else{
                done.set(stmt,false)
                stmt.dependencies
                    .forEach(handleDep)
                insert(stmt)
                done.set(stmt,true)
            }
        }else         console.log(`${"||||".repeat(depth--)}-------------------------------`)
    }
    let nsInProgress:Namespace
    function handleNS(initial:DependencyNode){
        if(nsInProgress){ //TODO nesting

        }else{
            const ns=initial.namespace
            nsInProgress=ns
            ns.statements.forEach(v=>{
                if([...v.referenceRoots.values()].some(v=>v.pos<ns.pos &&))
            })
        }
    }
    generateTree(source)
        .forEach(stmt=>handleDep(stmt))
    source.set({
        statements:newSource
    })
    return source.compilerNode
}
function generateTree(source:types.SourceFile){
    const dependencyTreeTops=new Set<DependencyNode>()
    const allDepNodes=new Map<depKey,DependencyNode|placeholder>()
    function handleRefs(node:depKey,namespace?:Namespace):DependencyNode{
        const existent=allDepNodes.get(node)
        if(existent==placeholder){
            //TODO recursive
            throw new Error("recursive")
        }else if(existent){
            if(namespace){
                namespace.statements.add(existent)
                existent.namespace=namespace
            }
            return existent
        }else if(check.isReferenceFindableNode(node)){
            allDepNodes.set(node,placeholder)
            const references=node.findReferencesAsNodes()
                .filter(r=>r.getSourceFile()==source) //only in current file
                .filter(r=>r.getParent()!=node) //filter out declaration referencing itself for some reason
            const referenceRoots=references
                .map(getTopParent)
                .map(r=>handleRefs(r))
            const nonConst=!isConstDecl(node)
            const dep:DependencyNode={
                pos:node.getPos(),
                node,
                nonConst,
                references:new Set(references),
                referenceRoots:new Set(referenceRoots),
                //updated by dependencies
                movable: !nonConst,
                dependencies:new Set()
            }
            referenceRoots.forEach(r=>{
                r.dependencies.add(dep)
                if(nonConst) r.movable=false
            })
            if(!referenceRoots.length){
                dependencyTreeTops.add(dep)
            }
            if(namespace){
                dep.namespace=namespace
                namespace.statements.add(dep)
            }
            allDepNodes.set(node,dep)
            return dep
        }else{
            const dep:DependencyNode={
                pos:node.getPos(),
                node,
                nonConst:true,
                referenceRoots:new Set(),
                references:new Set(),
                //updated by dependencies
                movable:false,
                dependencies:new Set()
            }
            dependencyTreeTops.add(dep)
            allDepNodes.set(node,dep)
            if(namespace){
                dep.namespace=namespace
                namespace.statements.add(dep)
            }
            return dep
        }
    }
    function handleNamespaceRefs(node:types.NamespaceDeclaration,namespace?:Namespace){
        const ns:Namespace={
            name:node.getName(),
            statements:new Set(),
            subspaces:new Set(),
            pos:node.getPos(),
            end:node.getEnd(),
            namespace
        }
        namespace?.subspaces.add(ns)
        //TODO handle namespace scoping
        node.getStatements().forEach(stmt=>{
            if(check.isNamespaceDeclaration(stmt)){
                handleNamespaceRefs(stmt,ns)
            }else if(check.isVariableStatement(stmt)){
                stmt.getDeclarations().forEach(dec=>{
                    handleRefs(dec,ns)
                })
            }else if(check.isReferenceFindableNode(stmt)){
                handleRefs(stmt,ns)
            }
        })
    }
    //*read dependency tree
    source.getStatements().forEach(stmt=>{
        if(check.isNamespaceDeclaration(stmt)){
            handleNamespaceRefs(stmt)
        }else if(check.isVariableStatement(stmt)){
            stmt.getDeclarations().forEach(dec=>{
                handleRefs(dec)
            })
        }else{
            handleRefs(stmt)
        }
    })
    return dependencyTreeTops
}
const project=new Project({
    tsConfigFilePath:require.resolve("./testFiles/tsconfig.json")
})
const file=project.getSourceFileOrThrow("testConstHoisting.cf.ts")
const printer=ts.createPrinter()
fs.writeFile(require.resolve("./testFiles/testConstHoisting.out.cf.ts"),printer.printFile(transform(file))) 
function unique(){
    const set=new Set()
    return v=>{
        const has=set.has(v)
        set.add(v)
        return !has
    }
}