package config
import (
	"bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/attribute"
	"strconv"
)
func dedupeAttributeInterfaces(attributes ...map[string]attribute.Attribute) []*attribute.Interface{
	incr:=make(map[string]int)
	outm:=make(map[string]*attribute.Interface)
	var recF func([]*attribute.Interface)
	recF=func(intf []*attribute.Interface){
		for _,v:=range intf{
			if comp,ok:=outm[v.Name];ok{
				if comp.Equals(v){
					*v=*comp
				}else{	
					v.Name+=strconv.Itoa(incr[v.Name])
					incr[v.Name]++
					outm[v.Name]=v
				}
			}else{
				incr[v.Name]=0
				outm[v.Name]=v
			}
			recF(v.GetInterfaces())
		}
	}
	for _,v:=range attributes{
		for _,v:=range v{
			recF(v.GetInterfaces())
		}
	}
	out:=make([]*attribute.Interface,0,len(outm))
	for _,v:=range outm{
		out=append(out,v)
	}
	return out
}