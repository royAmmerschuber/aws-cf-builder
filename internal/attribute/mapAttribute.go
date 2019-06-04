package attribute

import (
	"strings"
	"github.com/iancoleman/strcase"
	u "bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/util"

)

type MapAttribute struct{
	Name string
	TypeString string
	Required bool
	Comment string
	CommentBonus string
}

func (a MapAttribute) GenerateParameters() string{
	return "private _"+strcase.ToLowerCamel(a.Name)+":SMap<Field<"+a.TypeString+">>={}"
}
func (a MapAttribute) GenerateSetter() string{
	name:=""
	req:="false"
	bonusText:=""
	if a.Required{
		name=strcase.ToCamel(a.Name)
		req="true"
	}else{
		name=strcase.ToLowerCamel(a.Name)
	}

	if a.CommentBonus!=""{
		bonusText="\n * **"+a.CommentBonus+"**\n * "
	}

	pName:="this._"+strcase.ToLowerCamel(a.Name)
	return u.Multiline(
		"/**",
		" * **required: "+req+"**",
		" * ",
		" * **maps:**`"+a.Name+"`",
		" * "+bonusText,
		" * "+strings.ReplaceAll(a.Comment,"*/","* /"),
		" * @param map",
		" * items to add to the map",
		" */",
		name+"(map:SMap<Field<"+a.TypeString+">>):this",
		"/**",
		" * @param key",
		" * key of the item to add to the map",
		" * @param value",
		" * value of the item to add to the map",
		" */",
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
	setterName:=a.Name
	bonusText:=""
	req:="true"
	if !a.Required{
		setterName+="?"
		req="false"
	}
	return u.Multiline(
		"/**",
		" * **required: "+req+"**",
		" * "+bonusText,
		" * "+strings.ReplaceAll(a.Comment,"*/","* /"),
		" */",
		a.Name+":SMap<Field<"+a.TypeString+">>;\n",
	)
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