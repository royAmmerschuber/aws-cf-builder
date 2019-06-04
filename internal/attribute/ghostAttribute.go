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
func (a GhostAttribute) GetInterfaces() []*Interface{
	return []*Interface{}
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

func (_a GhostAttribute) Equals(a Attribute) bool{
	if a2,ok:=a.(GhostAttribute);ok{
		if (
			a2.TypeString==_a.TypeString &&
			a2.Field==_a.Field &&
			a2.Required==_a.Required){
			return true
		}
	}
	return false
}