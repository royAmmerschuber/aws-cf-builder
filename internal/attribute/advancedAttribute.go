package attribute

import (

	u "bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/util"
	"github.com/iancoleman/strcase"
)
type AdvancedAttribute struct{
	Max int
	Min int
	Name string
	Required bool
	Interface *Interface
}

func (a AdvancedAttribute) GenerateParameters() string{
	if a.Max==1{
		return "private _"+strcase.ToLowerCamel(a.Name)+":"+a.Interface.Name+";"
	}
	return "private _"+strcase.ToLowerCamel(a.Name)+":"+a.Interface.Name+"[]=[];"
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
			setterName+"("+pName+":"+a.Interface.Name+"):this{",
			"    this._"+parName+"="+pName+";",
			"    return this;",
			"}",
		)
	}
	return u.Multiline(
		setterName+"(..."+pName+":"+a.Interface.Name+"[]):this{",
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
func (a AdvancedAttribute) GetInterfaces() []*Interface{
	return []*Interface{a.Interface}
}
func (a AdvancedAttribute) GenerateCheck() string{
	//TODO implement
	return ""
}

func (a AdvancedAttribute) GenerateInterfaceProp() string{
	setterName:=a.Name
	if !a.Required{
		setterName+="?"
	}
	return setterName+":"+a.Interface.Name+"[];"
}

func (a AdvancedAttribute) GenerateRef() string{
	return strcase.ToLowerCamel(a.Name)+":new ReferenceField<"+a.Interface.Name+"[]>(this,'"+a.Name+"'),";
}
func (_a AdvancedAttribute) Equals(a Attribute) bool{
	if a2,ok:=a.(AdvancedAttribute);ok{
		if (
			a2.Required==_a.Required &&
			a2.Max==_a.Max && 
			a2.Min==_a.Min &&
			(a2.Interface==_a.Interface || a2.Interface.Equals(_a.Interface))){
			return true
		}
	}
	return false
}