package attribute
import (
	"github.com/iancoleman/strcase"
)
type Interface struct{
	Name string
	Attributes map[string]Attribute
}

func (i Interface) Generate() string{
	out:="interface "+strcase.ToCamel(i.Name)+"{\n"
	for _,a:=range i.Attributes{
		out+="    "+a.GenerateInterfaceProp()+"\n"
	}
	out+="}\n"
	return out
}
func (i Interface) GetInterfaces() []*Interface{
	out:=make([]*Interface,0)
	for _,a:=range i.Attributes{
		out=append(out,a.GetInterfaces()...)
	}
	return out
}

func (_i Interface) Equals(i *Interface) bool{
	if _i.Name=="ForwardedValues"{
		recover()
	}
	if len(_i.Attributes)==len(i.Attributes){
		x:=true
		for k,_v:=range _i.Attributes{
			v:=i.Attributes[k]
			if _v!=v && !_v.Equals(v){
				x=false
				break
			}
		}
		return x
	}
	return false
}