package config

import (
	"fmt"
	"sort"
	"strings"
	"sync"
	"encoding/json"
	"io/ioutil"
	"os"
	"path/filepath"
	"github.com/hashicorp/terraform/helper/schema"
	u "bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/util"
	"bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/attribute"
)
func GenerateProvider(name string, provider schema.Provider,confPath string) (Config,map[string]map[string]FileConfig){
	resources,datasources:=generateNameHierarchy(name,provider.ResourcesMap,provider.DataSourcesMap)
	var jsonConf jsonConfigGeneratable
	fileConf:=make(map[string]map[string]FileConfig)
	var mx sync.Mutex
	jsonConfigs:=make(map[string]jsonConfig)
	if c,err:=ioutil.ReadDir(confPath);err==nil{
		for _,v:=range c{
			if j,err:=ioutil.ReadFile(filepath.Join(confPath,v.Name()));err==nil{
				json.Unmarshal(j,jsonConfigs[v.Name()])
			}
		}
	}
	provConfig:=GenerateS(name,name,provider.Schema,jsonConf)
	for k,v:=range resources{
		var groupJson jsonConfig
		if j,err:=ioutil.ReadFile(filepath.Join(confPath,k+".json"));err==nil{
			json.Unmarshal(j,&jsonConf)
		}else{
			jsonConf=jsonConfigGeneratable{}
		}
		for k2,v2:=range v{
			go func(){

			}()
		}
	}
	for k,v:=range datasources{
		var groupJson jsonConfig
		if j,err:=ioutil.ReadFile(filepath.Join(confPath,k+".json"));err==nil{
			json.Unmarshal(j,&jsonConf)
		}else{
			jsonConf=jsonConfigGeneratable{}
		}
		for k2,v2:=range v{
			go func(){

			}()
		}
	}
	return provConfig,fileConf
}



func GenerateS(name string,identifier string,schem map[string]*schema.Schema,jsonConfig JsonConfigGeneratable) Config{
	var identAttr []string
	attr,comp:=schemaToAttributes(schem)
	if jsonConfig.NameParts!=nil{
		identAttr=jsonConfig.NameParts
		if u.ContainsString(identAttr,"_alias"){
			attr["_alias"]=attribute.GhostAttribute{
				Name:"name",
				Required:true,
				TypeString:"string",
			}
		}
	}else if _,ok:=attr["name"];ok{
		identAttr=[]string{"name"}
	}
	if name=="function"{
		fmt.Println(jsonConfig)
		fmt.Println(identAttr)
	}
	return Config{
		Name:name,
		Identifier:identifier,
		Attributes:attr,
		Comp:comp,
		IdentAttr:identAttr,
	}
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

