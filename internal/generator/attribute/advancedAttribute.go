package attribute

import (

	u "bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/util"
	"github.com/iancoleman/strcase"
)
type AdvancedAttribute struct{
	InterfaceName string
	Name string
	Required bool
	Attributes []Attribute
}

func (a AdvancedAttribute) GenerateParameters() string{
	return "private _"+strcase.ToLowerCamel(a.Name)+":"+a.InterfaceName+";"
}
func (a AdvancedAttribute) GenerateSetter() string{
	setterName:=""
	pName:=strcase.ToLowerCamel(a.Name)
	if a.Required{
		setterName=strcase.ToCamel(a.Name)
	}else{
		setterName=strcase.ToLowerCamel(a.Name)
	}
	return u.Multiline(
		setterName+"("+pName+":"+a.InterfaceName+"):this{",
		"    this._"+strcase.ToLowerCamel(a.Name)+"="+pName+";",
		"    return this;",
		"}",
	)
}
func (a AdvancedAttribute) GenerateGenerate() string{
	parName:="this._"+strcase.ToLowerCamel(a.Name)
	return a.Name+":"+parName+","
}
func (a AdvancedAttribute) GenerateInterfaces() string{
	out:="export interface "+a.InterfaceName+"{\n"
	for _,v := range a.Attributes{
		out+="    "+v.GenerateInterfaceProp()+"\n"
	}
	out+="}\n"
	for _,v :=range a.Attributes{
		out+=v.GenerateInterfaces()
	}
	return out
}
func (a AdvancedAttribute) GenerateCheck() string{
	//TODO implement DeepChecks
	if a.Required==false{
		return ""
	}
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

func (a AdvancedAttribute) GenerateInterfaceProp() string{
	setterName:=""
	if a.Required{
		setterName=strcase.ToCamel(a.Name)
	}else{
		setterName=strcase.ToLowerCamel(a.Name)+"?"
	}
	return setterName+":"+a.InterfaceName+"[];"
}