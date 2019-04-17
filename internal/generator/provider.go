package generator
import (
	"os"
	"path/filepath"

	u "bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/util"
	"github.com/iancoleman/strcase"
	"github.com/hashicorp/terraform/config/configschema"
)
func generateProvider(name string, schem *configschema.Block){
	f,err := os.Create(filepath.Join(Path,"provider.ts"))
	if err!=nil{
		panic(err)
	}
	defer f.Close()
	attributes:=blockToAttributes(*schem);
	className:=strcase.ToCamel(name)
	u.TryWrite(f,
		"import { SMap, generateObject, checkValid, prepareQueue, ResourceError } from '"+GeneralPath+"general'",
		"import { Provider } from '"+GeneralPath+"provider'",
	)
	u.TryWrite(f,
		"export class "+className+" extends Provider{",
		"    private readonly resourceIdentifier='"+className+"';",
		"    //#region Parameters",
	)
	for _,v := range attributes{
		u.TryWrite(f,u.Indent(1,v.GenerateParameters()))
	}
	u.TryWrite(f,
		"    //#endregion",
		"",
		"    //#region simpleResources",
	)
	for _,v := range attributes{
		u.TryWrite(f,u.Indent(1,v.GenerateSetter()))
	}
	u.TryWrite(f,
		"    //#endregion",
		"",
		"    //#region resource Functions",
	)
	u.TryWrite(f,
		"    [checkValid](){",
		"        const out:SMap<ResourceError>={};",
        "        const errors:string[]=[];",
	)
	for _,v:= range attributes{
		if check:=v.GenerateCheck(); check!=""{
			u.TryWrite(f,u.Indent(2,check))
		}
	}
	u.TryWrite(f,
        "        if(errors.length){",
        "            out[this.stacktrace]={",
        "                errors:errors,",
        "                type:this.resourceIdentifier",
        "            }",
        "        }",
        "        return out;",
		"    }",
	)
	u.TryWrite(f,
		"    [prepareQueue](module:any,param:any){}",
	)
	u.TryWrite(f,
		"    [generateObject](){",
		"        return {",
	)
	for _,v := range attributes{
		u.TryWrite(f,u.Indent(3,v.GenerateGenerate()))
	}
	u.TryWrite(f,
		"        };",
		"    }",
	)
	u.TryWrite(f,
		"    //#endregion",
		"}",
	)

	for _,v:= range attributes{
		if in:=v.GenerateInterfaces();in!=""{
			u.TryWrite(f,in)
		}
	}
}

