package attribute

import (

	u "bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/util"
	"github.com/iancoleman/strcase"
)
type ArrayAttribute struct{
	TypeString string
	Required bool
	Name string
}

func (a ArrayAttribute) GenerateParameters() string{
	return "private _"+strcase.ToLowerCamel(a.Name)+":"+a.TypeString+"[]=[];"
}
func (a ArrayAttribute) GenerateSetter() string{
	setterName:=""
	pName:=strcase.ToLowerCamel(a.Name)
	if a.Required{
		setterName=strcase.ToCamel(a.Name)
	}else{
		setterName=strcase.ToLowerCamel(a.Name)
	}
	
	return u.Multiline(
		setterName+"(..."+pName+":"+a.TypeString+"[]):this{",
		"    this._"+strcase.ToLowerCamel(a.Name)+".push(..."+pName+");",
		"    return this;",
		"}",
	)
}
func (a ArrayAttribute) GenerateGenerate() string{
	parName:="this._"+strcase.ToLowerCamel(a.Name)
	return a.Name+":"+parName+".length ? "+parName+" : undefined,"
}
func (a ArrayAttribute) GetInterfaces() []*Interface{
	return []*Interface{}
}
func (a ArrayAttribute) GenerateCheck() string{
	if a.Required==false{
		return ""
	}else{
		setterName:=""
		if a.Required{
			setterName=strcase.ToCamel(a.Name)
		}else{
			setterName=strcase.ToLowerCamel(a.Name)
		}
		return u.Multiline(
			"if(!this._"+strcase.ToLowerCamel(a.Name)+".length){",
			"    errors.push('you must specify at least one of Property "+setterName+"')",
			"}",
		)
	}
}

func (a ArrayAttribute) GenerateInterfaceProp() string{
	setterName:=a.Name
	if !a.Required{
		setterName+="?"
	}
	return setterName+":"+a.TypeString+"[];"
}

func (a ArrayAttribute) GenerateRef() string{
	return strcase.ToLowerCamel(a.Name)+":ReferenceField.create<"+a.TypeString+"[]>(this,'"+a.Name+"'),";
}

func (_a ArrayAttribute) Equals(a Attribute) bool{
	if a2,ok:=a.(ArrayAttribute);ok{
		if (
			a2.TypeString==_a.TypeString &&
			a2.Required==_a.Required){
			return true
		}
	}
	return false
}