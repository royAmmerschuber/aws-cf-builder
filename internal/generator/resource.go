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
		"import { SMap, ResourceError } from '../"+GeneralPath+"general'",
		"import { Resource } from '../"+GeneralPath+"resource'",
		"import { DataSource } from '../"+GeneralPath+"dataSource'",
		"import { Module } from '../"+GeneralPath+"module'",
		"import { Field, ReferenceField, fieldToId } from '../"+GeneralPath+"field'",
		"import _ from 'lodash'",
		"",
	)
	
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
	}
	if d:=config.DataSource;d!=nil{
		u.TryWrite(f,
			"export namespace "+d.Name+"{",
			"    export const Data=D"+d.Name,
			"    export type Data=D"+d.Name,
			"}",
		)
	}
	for _,v:=range config.Interfaces{
		t:=v.Generate()
		/* if config.Resource!=nil && config.Resource.Name=="Distribution"{
			fmt.Println(t)
		} */
		u.TryWrite(f,t)
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
	out+=u.Multiline(
		"//#endregion",
		"",
		"readonly d={",
	)
	for _,v := range config.Attributes{
		out+="    "+v.GenerateRef()+"\n"
	}
	for _,v :=range config.Comp{
		out+="    "+v.GenerateRef()+"\n"
	}
	out+=u.Multiline(
		"};",
		"",
		"constructor(",
	)
	for _,v := range config.IdentAttr{
		if a,ok:=config.Attributes[v].(attribute.SimpleAttribute);ok{
			out+="    "+strcase.ToLowerCamel(a.Name)+":Field<"+a.TypeString+">,"
		}else if a,ok:=config.Attributes[v].(attribute.GhostAttribute);ok{
			tName:=""
			if a.Field{
				tName="Field<"+a.TypeString+">"
			}else{
				tName=a.TypeString;
			}
			out+="    "+strcase.ToLowerCamel(a.Name)+":"+tName+","
		}else{
			panic(fmt.Errorf("%s: non simple IdentAttr",config.Name))
		}
	}
	out+=u.Multiline(
		"){",
		"    super(1)",
	)
	for _,v :=range config.IdentAttr{
		n:=""
		if a,ok:=config.Attributes[v].(attribute.SimpleAttribute);ok{
			n=strcase.ToLowerCamel(a.Name)
		}else if a,ok:=config.Attributes[v].(attribute.GhostAttribute);ok{
			n=strcase.ToLowerCamel(a.Name)
		}
		out+="    this._"+n+"="+n+";"
	}
	out+=u.Multiline(
		"}",
		"",
		"//#region simpleResources",
	)
	for k,v :=range config.Attributes{
		if !u.ContainsString(config.IdentAttr,k){
			out+=v.GenerateSetter()
		}
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
	for _,v:= range config.Attributes{
		if check:=v.GenerateCheck(); check!=""{
			out+=u.Indent(1,check)
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
	out+="protected prepareQueue(module:Module,param:any){}\n"
	out+=u.Multiline(
		"protected generateObject(){",
		"    return {",
	)
	for _,v := range config.Attributes{
		out+="    "+v.GenerateGenerate()+"\n"
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