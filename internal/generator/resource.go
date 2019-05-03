package generator

import (
	"os"
	"fmt"
	u "bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/util"
	"bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/config"
	"bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/attribute"
	"github.com/iancoleman/strcase"
)

func generateResourceFile(file string,config *config.FileConfig){
	f,err := os.Create(file)
	if err!=nil{
		panic(err)
	}
	defer f.Close()
	u.TryWrite(f,
		"import _ from 'lodash'",
		"import { Module } from '../"+GeneralPath+"module'",
		"import { SMap, ResourceError } from '../"+GeneralPath+"general'",
		"import { Field, ReferenceField, fieldToId } from '../"+GeneralPath+"field'",
	)
	if r:=config.Resource;r!=nil{
		u.TryWrite(f,"import { Resource } from '../"+GeneralPath+"resource'")
	}
	if config.DataSource!=nil{
		u.TryWrite(f,"import { DataSource } from '../"+GeneralPath+"dataSource'")
	}
	u.TryWrite(f,importChildren(config.Resource,config.DataSource))

	if r:=config.Resource;r!=nil{
		u.TryWrite(f,
			"export class "+r.Name+" extends Resource{",
			u.Indent(1,generateCore(r)),
			"}",
		)
	}
	if d:=config.DataSource;d!=nil{
		u.TryWrite(f,
			"class D"+d.Name+" extends DataSource{",
			u.Indent(1,generateCore(d)),
			"}",
		)
		u.TryWrite(f,
			"export namespace "+d.Name+"{",
			"    export const Data=D"+d.Name,
			"    export type Data=D"+d.Name,
			"}",
		)
	}
	for _,v:=range config.Interfaces{
		u.TryWrite(f,v.Generate())
	}
}

func generateCore(config *config.Config) string{
	out:=u.Multiline(
		"protected readonly resourceIdentifier='"+config.Identifier+"'",
		"//#region Parameters",
	)
	for _,v :=range config.Attributes{
		out+=""+v.GenerateParameters()+"\n"
	}
	for _,v :=range config.Children{
		out+="private $"+strcase.ToLowerCamel(v.Name)+"s:"+v.Name+"[]=[];\n"
	}
	out+=u.Multiline(
		"//#endregion",
		"",
		"readonly d={",
	)
	for _,v := range config.Attributes{
		if r:=v.GenerateRef();r!=""{
			out+="    "+r+"\n"
		}
	}
	for _,v :=range config.Comp{
		if r:=v.GenerateRef();r!=""{
			out+="    "+r+"\n"
		}
	}
	out+=u.Multiline(
		"};",
		"",
		"constructor(",
	)
	for _,v := range config.IdentAttr{
		if _,ok:=config.Inherits[v]; !ok{
			if a,ok:=config.Attributes[v].(attribute.SimpleAttribute);ok{
				out+="    "+strcase.ToLowerCamel(a.Name)+":Field<"+a.TypeString+">,\n"
			}else if a,ok:=config.Attributes[v].(attribute.GhostAttribute);ok{
				tName:=""
				if a.Field{
					tName="Field<"+a.TypeString+">"
				}else{
					tName=a.TypeString;
				}
				out+="    "+strcase.ToLowerCamel(a.Name)+":"+tName+",\n"
			}else{
				panic(fmt.Errorf("%s: non simple IdentAttr",config.Name))
			}
		}
	}
	out+=u.Multiline(
		"){",
		"    super(1)",
	)
	for _,v :=range config.IdentAttr{
		if _,ok:=config.Inherits[v]; !ok{
			n:=""
			if a,ok:=config.Attributes[v].(attribute.SimpleAttribute);ok{
				n=strcase.ToLowerCamel(a.Name)
			}else if a,ok:=config.Attributes[v].(attribute.GhostAttribute);ok{
				n=strcase.ToLowerCamel(a.Name)
			}
			out+="    this._"+n+"="+n+";\n"
		}
	}
	out+=u.Multiline(
		"}",
		"",
		"//#region simpleResources",
	)
	for k,v :=range config.Attributes{
		if !u.ContainsString(config.IdentAttr,k){
			if _,ok:=config.Inherits[k]; !ok{
				out+=v.GenerateSetter()
			}
		}
	}
	for _,v:=range config.Children{
		lName:=strcase.ToLowerCamel(v.Name)
		out+=u.Multiline(
			lName+"(..."+lName+"s:"+v.Name+"[]){",
			"    this.$"+lName+"s.push(..."+lName+"s)",
			"    return this",
			"}",
		)
	}
	out+=u.Multiline(
		"//#endregion",
		"",
		"//#region resource Functions",
	)
	out+=u.Multiline(
		"protected checkValid(){",
		"    const out:SMap<ResourceError>={};",
		"    const errors:string[]=[];",
	)
	for k,v:= range config.Attributes{
		if _,ok:=config.Inherits[k]; !ok{
			if check:=v.GenerateCheck(); check!=""{
				out+=u.Indent(1,check)
			}
		}
	}
	out+=u.Multiline(
        "    if(errors.length){",
        "        out[this.stacktrace]={",
        "            errors:errors,",
        "            type:this.resourceIdentifier",
        "        }",
        "    }",
        "    return out;",
		"}",
	)
	out+="protected prepareQueue(module:Module,param:any){"
	if config.Provides!=""{
		out+="\n    param."+config.Provides+"=this\n"
	}
	out+="}\n"
	if len(config.Inherits)>0{
		out+="protected injectDependencies(param:any){\n"
		for k,v:=range config.Inherits{
			if a,ok:=config.Attributes[k];ok{
				if a,ok:=a.(attribute.SimpleAttribute);ok{
					out+="    if(param."+v[0]+"===undefined) throw new Error(this.stacktrace+'\\nresource is missing inherited parameter "+v[0]+"')\n"
					out+="    this._"+strcase.ToLowerCamel(a.Name)+"=param."+v[0]+".d."+v[1]+"\n"
				}else{
					panic(fmt.Errorf("inherited property is non simple"))
				}
				
			}else{
				panic(fmt.Errorf("inherited Property does not exist"))
			}
		}
		out+="}\n"
	}
	out+=u.Multiline(
		"protected generateObject(){",
		"    return {",
	)
	for _,v := range config.Attributes{
		if g:=v.GenerateGenerate(); g!=""{
			out+="        "+g+"\n"
		}
	}
	out+=u.Multiline(
		"    };",
		"}",
	)
	{
		gen:=func(s string) string{
			field:=""
			if a,ok:=config.Attributes[s].(attribute.SimpleAttribute);ok{
				field+="fieldToId(this._"+strcase.ToLowerCamel(a.Name)+")"
			}else if a,ok:=config.Attributes[s].(attribute.GhostAttribute);ok{
				if a.Field{
					field+="fieldToId(this._"+strcase.ToLowerCamel(a.Name)+")"
				}else {
					field+="this._"+strcase.ToLowerCamel(a.Name)
				}
			}else{
				panic("!!!")
			}
			return "_.capitalize("+field+")"
		}
		genName:=""
		if l:=len(config.IdentAttr);l>0{
			if l>1{
				for _,v:=range config.IdentAttr[:l-1]{
					genName+=gen(v)+"+"
				}
			}
			genName+=gen(config.IdentAttr[l-1])
		}
		if genName==""{
			genName="''"
		}
		out+=u.Multiline(
			"protected generateName(){",
			"    return "+genName,
			"}",
		)
		out+=u.Multiline()
	}
	out+="//#endregion\n"
	return out
}

func importChildren(res *config.Config, dat *config.Config) string{
	out:=""
	done:=make([]*config.Config,0)
	if res!=nil{
		if res.Name=="Function"{
			fmt.Printf("\r%+v\n",res.Children)
		}
		for _,v:=range res.Children{
			done=append(done,v)
			out+="import { "+v.Name+" } from '../"+v.Path+"'"
		}
	}
	if dat!=nil{
		for _,v:=range dat.Children{
			if !containsConfig(done,v){
				out+="import { "+v.Name+" } from '../"+v.Path+"'"
			}
		}
	}
	return out
}


func containsConfig(arr []*config.Config,key *config.Config) bool{
	for _,v:=range arr{
		if v==key{
			return true
		}
	}
	return false
}