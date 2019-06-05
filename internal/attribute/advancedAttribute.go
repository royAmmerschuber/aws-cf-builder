package attribute

import (
	"strings"
	u "bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/util"
	"github.com/iancoleman/strcase"
)
type AdvancedAttribute struct{
	Max int
	Min int
	Name string
	Required bool
	IsMap bool
	Interface *Interface
	Comment string
}

func (a AdvancedAttribute) GenerateParameters() string{
	typ:=""
	if a.IsMap{
		typ="SMap<"+a.Interface.Name+">={}"
	}else if a.Max==1{
		typ=a.Interface.Name
	}else{
		typ=a.Interface.Name+"[]=[]"
	}
	return "private _"+strcase.ToLowerCamel(a.Name)+":"+typ+";"
}
func (a AdvancedAttribute) GenerateSetter() string{
	setterName:=""
	pName:=strcase.ToLowerCamel(a.Name)
	req:="false"
	if a.Required{
		req="true"
		setterName=strcase.ToCamel(a.Name)
	}else{
		setterName=strcase.ToLowerCamel(a.Name)
	}
	parName:="this._"+strcase.ToLowerCamel(a.Name)
	if a.IsMap{
		return u.Multiline(
			"/**",
			" * __required: "+req+"__",
			" * ",
			" * __maps:__`"+a.Name+"`",
			" * ",
			" * "+strings.ReplaceAll(a.Comment,"*/","* /"),
			" * @param map",
			" * items to add to the map",
			" */",
			setterName+"(map:SMap<"+a.Interface.Name+">):this",
			"/**",
			" * @param key",
			" * key of the item to add to the map",
			" * @param value",
			" * value of the item to add to the map",
			" */",
			setterName+"(key:string,value:"+a.Interface.Name+"):this",
			setterName+"(mk:string|SMap<"+a.Interface.Name+">,value?:"+a.Interface.Name+"){",
			"    if(typeof mk!='string'){",
			"        _.assign("+parName+",mk)",
			"    }else{",
			"        "+parName+"[mk]=value",
			"    }",
			"    return this",
			"}",
		)
	}else{
		comment:=u.Multiline(
			"/**",
			" * @param "+pName,
			" * __required: "+req+"__",
			" * ",
			" * __maps:__`"+a.Name+"`",
			" * ",
			" * "+strings.ReplaceAll(a.Comment,"*/","* /"),
			" */",
		)
		if a.Max==1{
			return u.Multiline(
				comment,
				setterName+"("+pName+":"+a.Interface.Name+"):this{",
				"    "+parName+"="+pName+";",
				"    return this;",
				"}",
			)
		}
		return u.Multiline(
			comment,
			setterName+"(..."+pName+":"+a.Interface.Name+"[]):this{",
			"    "+parName+".push(..."+pName+");",
			"    return this;",
			"}",
		)
	}
}
func (a AdvancedAttribute) GenerateGenerate() string{
	parName:="this._"+strcase.ToLowerCamel(a.Name)
	if a.IsMap{
		return a.Name+":_.size("+parName+") ? "+parName+" : undefined,"
	}else if a.Max==1{
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
	typ:=""
	if a.IsMap{
		typ="SMap<"+a.Interface.Name+">"
	}else{
		typ=a.Interface.Name+"[]"
	}
	return setterName+":"+typ+";\n"
}

func (_a AdvancedAttribute) Equals(a Attribute) bool{
	if a2,ok:=a.(AdvancedAttribute);ok{
		if (
			_a.Required==a2.Required &&
			_a.Max==a2.Max && 
			_a.Min==a2.Min &&
			_a.IsMap==a2.IsMap &&
			(_a.Interface==a2.Interface || _a.Interface.Equals(a2.Interface))){
			return true
		}
	}
	return false
}