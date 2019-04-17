package attribute

import (
	u "bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/util"
	"github.com/iancoleman/strcase"
)

type SimpleAttribute struct{
	TypeString string
	Required bool
	Name string
}

func (a SimpleAttribute) GenerateParameters() string{
	return "private _"+strcase.ToLowerCamel(a.Name)+":"+a.TypeString+";"
}
func (a SimpleAttribute) GenerateSetter() string{
	setterName:=""
	pName:=""
	if a.Required{
		setterName=strcase.ToCamel(a.Name)
	}else{
		setterName=strcase.ToLowerCamel(a.Name)
	}
	if a.TypeString=="boolean"{
		pName="bool"
	}else{
		pName=strcase.ToLowerCamel(a.Name)
	}
	return u.Multiline(
		setterName+"("+pName+":"+a.TypeString+"):this{",
		"    this._"+strcase.ToLowerCamel(a.Name)+"="+pName+";",
		"    return this;",
		"}",
	)
}

func (a SimpleAttribute) GenerateGenerate() string{
	return a.Name+":this._"+strcase.ToLowerCamel(a.Name)+","
}
func (a SimpleAttribute) GenerateInterfaces() string{
	return ""
}
func (a SimpleAttribute) GenerateCheck() string{
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
			"if(this._"+strcase.ToLowerCamel(a.Name)+"===undefined){",
			"    errors.push('you must specify Property "+setterName+"')",
			"}",
		)
	}
}

func (a SimpleAttribute) GenerateInterfaceProp() string{
	setterName:=""
	if a.Required{
		setterName=strcase.ToCamel(a.Name)
	}else{
		setterName=strcase.ToLowerCamel(a.Name)+"?"
	}
	return setterName+":"+a.TypeString+";"
}