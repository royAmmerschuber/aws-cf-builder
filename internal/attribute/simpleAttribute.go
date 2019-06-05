package attribute

import (
	"strings"
	u "bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/util"
	"github.com/iancoleman/strcase"
)

type SimpleAttribute struct{
	Comment string
	CommentBonus string
	TypeString string
	Required bool
	Name string
}

func (a SimpleAttribute) GenerateParameters() string{
	return "private _"+strcase.ToLowerCamel(a.Name)+":Field<"+a.TypeString+">;"
}
func (a SimpleAttribute) GenerateSetter() string{
	setterName:=""
	pName:=""
	bonusText:=""
	req:="false"
	if a.Required{
		setterName=strcase.ToCamel(a.Name)
		req="true"
	}else{
		setterName=strcase.ToLowerCamel(a.Name)
	}
	if a.TypeString=="boolean"{
		pName="bool"
	}else{
		pName=strcase.ToLowerCamel(a.Name)
	}

	if a.CommentBonus!=""{
		bonusText="\n * __"+a.CommentBonus+"__\n * "
	}
	

	return u.Multiline(
		"/**",
		" * @param "+pName,
		" * __required: "+req+"__",
		" * ",
		" * __maps:__`"+a.Name+"`",
		" * "+bonusText,
		" * "+strings.ReplaceAll(a.Comment,"*/","* /"),
		" */",
		setterName+"("+pName+":Field<"+a.TypeString+">):this{",
		"    this._"+strcase.ToLowerCamel(a.Name)+"="+pName+";",
		"    return this;",
		"}",
	)
}

func (a SimpleAttribute) GenerateGenerate() string{
	return a.Name+":this._"+strcase.ToLowerCamel(a.Name)+","
}
func (a SimpleAttribute) GetInterfaces() []*Interface{
	return []*Interface{}
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
	setterName:=a.Name
	reqText:="true"
	bonusText:=""
	if !a.Required{
		setterName+="?"
		reqText="false"
	}

	if a.CommentBonus!=""{
		bonusText="\n * __"+a.CommentBonus+"__\n * "
	}

	return u.Multiline(
		"/**",
		" * __required: "+reqText+"__",
		" * "+bonusText,
		" * "+strings.ReplaceAll(a.Comment,"*/","* /"),
		" */",
		setterName+":"+a.TypeString+";",
	)
}

func (_a SimpleAttribute) Equals(a Attribute) bool{
	if a2,ok:=a.(SimpleAttribute);ok{
		if (
			a2.TypeString==_a.TypeString &&
			a2.Required==_a.Required){
			return true
		}
	}
	return false
}