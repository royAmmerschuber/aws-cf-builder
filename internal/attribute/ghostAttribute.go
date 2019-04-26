package attribute
import (
	u "bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/util"
	"github.com/iancoleman/strcase"
)
type GhostAttribute struct{
	TypeString string
	Required bool
	Name string
	Field bool
}

func (a GhostAttribute) GenerateParameters() string {
	tName:=""
	if a.Field{
		tName="Field<"+a.TypeString+">"
	}else{
		tName=a.TypeString;
	}
	return "private _"+strcase.ToLowerCamel(a.Name)+":"+tName+";"
}
func (a GhostAttribute) GenerateSetter() string {
	setterName:=""
	pName:=""
	tName:=""
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
	if a.Field{
		tName="Field<"+a.TypeString+">"
	}else{
		tName=a.TypeString;
	}
	return u.Multiline(
		setterName+"("+pName+":"+tName+"):this{",
		"    this._"+strcase.ToLowerCamel(a.Name)+"="+pName+";",
		"    return this;",
		"}",
	)
}
func (a GhostAttribute) GenerateGenerate() string {
	return ""
}
func (a GhostAttribute) GenerateInterfaces() string {
	return ""
}
func (a GhostAttribute) GenerateCheck() string {
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
func (a GhostAttribute) GenerateInterfaceProp() string {
	return ""
}
func (a GhostAttribute) GenerateRef() string {
	return ""
}