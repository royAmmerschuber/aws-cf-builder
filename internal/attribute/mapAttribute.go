package attribute

import (
	"github.com/iancoleman/strcase"
	u "bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/util"

)

type MapAttribute struct{
	Name string
	TypeString string
	Required bool
}

func (a MapAttribute) GenerateParameters() string{
	return "private _"+strcase.ToLowerCamel(a.Name)+":SMap<Field<"+a.TypeString+">>={}"
}
func (a MapAttribute) GenerateSetter() string{
	name:=""
	if a.Required{
		name=strcase.ToCamel(a.Name)
	}else{
		name=strcase.ToLowerCamel(a.Name)
	}
	pName:="this._"+strcase.ToLowerCamel(a.Name)
	return u.Multiline(
		name+"(map:SMap<Field<"+a.TypeString+">>):this",
		name+"(key:string,value:Field<"+a.TypeString+">):this",
		name+"(mk:string|SMap<Field<"+a.TypeString+">>,value?:Field<"+a.TypeString+">){",
		"    if(typeof mk!='string'){",
		"        _.assign("+pName+",mk)",
		"    }else{",
		"        "+pName+"[mk]=value",
		"    }",
		"    return this",
		"}",
	)
}
func (a MapAttribute) GenerateGenerate() string{
	pName:="this._"+strcase.ToLowerCamel(a.Name)
	return a.Name+":_.size("+pName+") ? "+pName+" : undefined,"
}
func (a MapAttribute) GetInterfaces() []*Interface{
	return []*Interface{}
}
func (a MapAttribute) GenerateCheck() string{
	pName:="this._"+strcase.ToLowerCamel(a.Name)
	name:=""
	if a.Required{
		name=strcase.ToCamel(a.Name)
	}else{
		name=strcase.ToLowerCamel(a.Name)
	}
	return u.Multiline(

		"if(_.size("+pName+")){",
		"    errors.push('you must specify Property "+name+"')",
		"}",
	)
}
func (a MapAttribute) GenerateInterfaceProp() string{
	return a.Name+":SMap<Field<"+a.TypeString+">>"
}
func (a MapAttribute) GenerateRef() string{
	return strcase.ToLowerCamel(a.Name)+":new ReferenceField<SMap<"+a.TypeString+">>(this,'"+a.Name+"'),"
}
func (_a MapAttribute) Equals(a Attribute) bool{
	if a2,ok:=a.(MapAttribute);ok{
		if a2.TypeString==_a.TypeString &&
			a2.Required==_a.Required{
				return true
		}
	}
	return false
}