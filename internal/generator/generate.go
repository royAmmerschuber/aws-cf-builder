package generator

import (
	"fmt"
	"os"
	"io/ioutil"
	"path/filepath"
	"sort"
	"strings"
	"encoding/json"
	"github.com/schollz/progressbar/v2"
	"github.com/hashicorp/terraform/terraform"
	"github.com/hashicorp/terraform/config/configschema"
	"github.com/hashicorp/terraform/helper/schema"
	"github.com/iancoleman/strcase"
	"bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/attribute"
	u "bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/util"
	"bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/config"
)
var Path string
var ConfPath string
var GeneralPath string ="../../js/general/"
var Perm os.FileMode=0777

func Generate(name string, provider schema.Provider) {
	provPath:=filepath.Join(Path,name)

	fmt.Println("using Schema")
	os.MkdirAll(provPath,Perm)
	var jsonConf config.JsonConfigGeneratable
	if j,ok:=ioutil.ReadFile(filepath.Join(ConfPath,"_provider.json"));ok==nil{
		json.Unmarshal(j,&jsonConf)
	}else{
		jsonConf=config.JsonConfigGeneratable{}
	}
	generateProvider(provPath,config.GenerateS(name,name,provider.Schema,jsonConf))

	resources,datasources:=generateNameHierarchy(name,provider.ResourcesMap,provider.DataSourcesMap)
	prog:=progressbar.New(len(resources))
	resC:=make(chan bool)
	catch:=func(group string){
		if r:=recover();r!=nil{
			fmt.Printf("paniced while creating ResourceGroup %s error was: %v\n",group,r)
			resC <- false
		}else{
			resC <- true
		}
	}
	
	os.Mkdir(filepath.Join(provPath,"Resource"),Perm)
	for k,v2:=range resources{
		go func(k string,v2 map[string]string){
			defer catch(k)
			folderName:=filepath.Join(provPath,"Resource",strcase.ToCamel(k))
			os.Mkdir(folderName,Perm)
			var jsonConf config.JsonConfig
			if j,ok:=ioutil.ReadFile(filepath.Join(ConfPath,strcase.ToLowerCamel(k)+".json"));ok==nil{
				json.Unmarshal(j,&jsonConf)
				m,_:=json.Marshal(jsonConf)
				fmt.Printf("%s\n",m)
			}else{
				jsonConf=config.JsonConfig{
					Resources:map[string]config.JsonConfigGeneratable{},
					Datasources:map[string]config.JsonConfigGeneratable{},
				}
			}
			for k,v2 := range v2{
				resConf,ok:=jsonConf.Resources[k]
				if !ok{
					resConf=config.JsonConfigGeneratable{}
				}
				generateResource(folderName,config.GenerateS(k,v2,provider.ResourcesMap[v2].Schema,resConf))
			}
		}(k,v2)
	}
	
	os.Mkdir((filepath.Join(provPath,"DataSource")),Perm)
	for k,v2:=range datasources{
		go func(k string, v2 map[string]string){
			defer catch(k)
			folderName:=filepath.Join(provPath,"DataSource",strcase.ToCamel(k))
			os.Mkdir(folderName,Perm)
			var jsonConf config.JsonConfig
			if j,ok:=ioutil.ReadFile(filepath.Join(ConfPath,strcase.ToLowerCamel(k)+".json"));ok==nil{
				json.Unmarshal(j,&jsonConf)
			}else{
				jsonConf=config.JsonConfig{
					Resources:map[string]config.JsonConfigGeneratable{},
					Datasources:map[string]config.JsonConfigGeneratable{},
				}
			}
			for k,v2 := range v2{
				resConf,ok:=jsonConf.Datasources[k]
				if !ok{
					resConf=config.JsonConfigGeneratable{}
				}
				generateDataSource(folderName,config.GenerateS(k,v2,provider.DataSourcesMap[v2].Schema,resConf))
			}
		}(k,v2)
	}

	failed:=0
	for i:=0;i<len(resources)+len(datasources);i++{
		if !<-resC{
			failed++
			prog.Add(1)
		}
	}
	prog.Finish()

	fmt.Println("\nfailed:",failed)
	
}

func getSchema(p terraform.ResourceProvider) *terraform.ProviderSchema{
	rNames := make([]string,0)
	hasSchema:=false
	for _,r := range p.Resources() {
		if r.SchemaAvailable{
			rNames=append(rNames,r.Name)
			hasSchema=true
		}
	}
	dNames:=make([]string,0)
	for _,d := range p.DataSources(){
		if d.SchemaAvailable{
			dNames=append(dNames,d.Name)
			hasSchema=true
		}
	}
	if !hasSchema{
		panic(fmt.Errorf("provider has no Schema"))
	}
	schem,_:= p.GetSchema(&terraform.ProviderSchemaRequest{
		DataSources:dNames,
		ResourceTypes:rNames,
	})
	return schem
}

func blockToAttributes(s configschema.Block) map[string]attribute.Attribute{
	out :=make(map[string]attribute.Attribute,0)
	for k,v :=range s.Attributes{
		switch{
			case v.Type.IsPrimitiveType():{
				out[k]=attribute.SimpleAttribute{
					Name:k,
					Required:v.Required,
					TypeString:u.CtyToTsType(v.Type),
				}
			}
			case v.Type.IsSetType() || v.Type.IsListType():{
				out[k]=attribute.ArrayAttribute{
					Name:k,
					Required:v.Required,
					TypeString:u.CtyToTsType(v.Type.ElementType()),
				}
			}
		}
	}
	for k,v :=range s.BlockTypes{
		
		out[k]=attribute.AdvancedAttribute{
			InterfaceName:strcase.ToCamel(k),
			Name:k,
			Required:v.MinItems>0,
			Attributes:blockToAttributes(v.Block),
		}
	}
	return out
}


func generateNameHierarchy(providerName string, resources map[string]*schema.Resource,datasources map[string]*schema.Resource) (map[string]map[string]string,map[string]map[string]string){
	rkeys,dkeys := make([]string, 0, len(resources)),make([]string,0,len(datasources))
	for k := range resources{
		rkeys=append(rkeys,k)
	}
	sort.Strings(rkeys)
	for k := range datasources{
		dkeys=append(dkeys,k)
	}
	sort.Strings(dkeys)
	r := make(map[string][]string,0)
	for _,k:=range rkeys{
		s:=strings.Split(k,"_")
		if r[s[1]]==nil{
			r[s[1]]=make([]string,0);
		}
		r[s[1]]=append(r[s[1]],strings.Join(s[2:],"_"))
	}
	d := make(map[string][]string,0)
	for _,k:=range dkeys{
		s:=strings.Split(k,"_")
		if d[s[1]]==nil{
			d[s[1]]=make([]string,0);
		}
		d[s[1]]=append(d[s[1]],strings.Join(s[2:],"_"))
	}
	resR := make(map[string]map[string]string)
	resD := make(map[string]map[string]string)
	for k,v := range r{
		comp:=strings.Split(v[0],"_");
		leng:=len(comp)
		
		if len(v)>1{
			for _,v2:=range v[1:]{
				for i,v2:=range strings.Split(v2,"_"){
					if i>=leng || v2!=comp[i]{
						leng=i
						break
					}
				}
			}
		}
		ds,dOk:=d[k];
		if dOk{
			for _,v2:=range ds{
				for i,v2:=range strings.Split(v2,"_"){
					if i>=leng || v2!=comp[i]{
						leng=i
						break
					}
				}
			}
		}

		prefix:=strings.Join(comp[:leng],"_");
		key := k
		if prefix!=""{
			key+="_"+prefix
		}
		resR[key]=make(map[string]string,0)
		fmt.Println(key+":")
		for _,v2:=range v{
			name:=strings.TrimPrefix(strings.TrimPrefix(v2,prefix),"_")
			identifier:=providerName+"_"+key
			if name!=""{
				identifier+="_"+name
			}else{
				name=key
			}
			fmt.Println("r   ",name,"    :    ",identifier)
			resR[key][name]=identifier
		}
		if dOk{
			resD[key]=make(map[string]string,0)
			for _,v2:=range ds{
				name:=strings.TrimPrefix(strings.TrimPrefix(v2,prefix),"_")
				identifier:=providerName+"_"+key
				if name!=""{
					identifier+="_"+name
				}else{
					name=key
				}
				fmt.Println("d   ",name,"    :    ",identifier)
				resD[key][name]=identifier
			}
		}
	}
	for k,v :=range d{
		
		if _,ok:=r[k];!ok{
			comp:=strings.Split(v[0],"_");
			leng:=0
			
			if len(v)>1{
				for _,v2:=range v[1:]{
					for i,v2:=range strings.Split(v2,"_"){
						if i>=leng || v2!=comp[i]{
							leng=i
							break
						}
					}
				}
			}
			prefix:=strings.Join(comp[:leng],"_");
			key := k
			if prefix!=""{
				key+="_"+prefix
			}
			resD[key]=make(map[string]string,0)
			fmt.Println(key+":")
			for _,v2:=range v{
				name:=strings.TrimPrefix(strings.TrimPrefix(v2,prefix),"_")
				identifier:=providerName+"_"+key
				if name!=""{
					identifier+="_"+name
				}else{
					name=key
				}
				fmt.Println("d   ",name,"    :    ",identifier)
				resD[key][name]=identifier
			}
		}
	}
	fmt.Println(len(resR))
	fmt.Println(len(resD))
	return resR,resD
}