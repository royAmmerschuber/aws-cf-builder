package attribute

import (

	u "bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/util"
	"github.com/iancoleman/strcase"
)
type AdvancedAttribute struct{
	Max int
	Min int
	InterfaceName string
	Name string
	Required bool
	Attributes []Attribute
}

func (a AdvancedAttribute) GenerateParameters() string{
	if a.Max==1{
		return "private _"+strcase.ToLowerCamel(a.Name)+":"+a.InterfaceName+";"
	}
	return "private _"+strcase.ToLowerCamel(a.Name)+":"+a.InterfaceName+"[]=[];"
}
func (a AdvancedAttribute) GenerateSetter() string{
	setterName:=""
	pName:=strcase.ToLowerCamel(a.Name)
	if a.Required{
		setterName=strcase.ToCamel(a.Name)
	}else{
		setterName=strcase.ToLowerCamel(a.Name)
	}
	parName:=strcase.ToLowerCamel(a.Name)
	if a.Max==1{
		return u.Multiline(
			setterName+"("+pName+":"+a.InterfaceName+"):this{",
			"    this._"+parName+"="+pName+";",
			"    return this;",
			"}",
		)
	}
	return u.Multiline(
		setterName+"(..."+pName+":"+a.InterfaceName+"[]):this{",
		"    this._"+parName+".push(..."+pName+");",
		"    return this;",
		"}",
	)
}
func (a AdvancedAttribute) GenerateGenerate() string{
	parName:="this._"+strcase.ToLowerCamel(a.Name)
	if a.Max==1{
		return a.Name+":"+parName+" && ["+parName+"],"
	}
	return a.Name+":"+parName+".length ? "+parName+" : undefined,"
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
	//TODO implement
	return ""
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