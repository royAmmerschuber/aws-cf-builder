package util
import (
	"os"
	"fmt"
	"strings"

	"github.com/zclconf/go-cty/cty"
)

func Multiline(s ...string)string{
	out:=""
	for _,l :=range s{
		out+=l+"\n"
	}
	return out
}
func Indent(depth int,s string) string{
	indent:=strings.Repeat("    ",depth)
	return indent+strings.ReplaceAll(s,"\n","\n"+indent)
}
func TryWrite(f *os.File,s ...string) int{
	sum:=0
	for _,l :=range s{
		if out,err:=f.Write([]byte(l+"\n")); err!=nil{
			panic(err)
		}else{
			sum+=out
		}
	}
	return sum
}
func CtyToTsType(t cty.Type) string{
	switch {
		case t.Equals(cty.Bool):{
			return "boolean"
		}
		case t.Equals(cty.String):{
			return "string"
		}
		case t.Equals(cty.Number):{
			return "number"
		}
	}
	panic(fmt.Errorf("wierd Type found: %v",t.GoString()))
}

func ContainsString(arr []string ,key string) bool{
	for _,v:=range arr{
		if v==key{
			return true
		}
	}
	return false
}