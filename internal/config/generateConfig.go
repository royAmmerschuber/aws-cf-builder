package config

import (
	"fmt"
	"sort"
	"strings"
	"sync"
	"encoding/json"
	"runtime/debug"
	"io/ioutil"
	"time"
	"path/filepath"
	"github.com/schollz/progressbar/v2"
	"github.com/iancoleman/strcase"
	"github.com/hashicorp/terraform/helper/schema"
	u "bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/util"
	"bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/attribute"
	"bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/config/docs"
)

const verboseError=false

func GenerateProvider(name string, provider schema.Provider,confPath string, docsPath string) (ProviderConfig,map[string]*map[string]*FileConfig){
	fmt.Println("# generating Config:")
	fmt.Println("## generate Hierarchy:")
	resources,datasources:=generateNameHierarchy(name,provider.ResourcesMap,provider.DataSourcesMap,false)
	fileConf:=make(map[string]*map[string]*FileConfig)
	var mx sync.Mutex
	completed:=make(chan bool)
	
	fmt.Println("## read Docs")
	docsR:=make(map[string]docs.DocStructure)
	docsD:=make(map[string]docs.DocStructure)
	docP:=docs.DocStructure{}
	{
		fileP,err:=ioutil.ReadFile(filepath.Join(docsPath,"index.html.markdown"))
		if err!=nil{
			fmt.Println("provider docs not found under:",filepath.Join(docsPath,"index.html.markdown"))
		}else{
			_,docP=docs.GenerateDocumentStructure(fileP)
		}
		
		filesR,errR:=ioutil.ReadDir(filepath.Join(docsPath,"r"))
		filesD,errD:=ioutil.ReadDir(filepath.Join(docsPath,"d"))
		if errR!=nil{
			fmt.Println("resource docs not found")
		}
		if errD!=nil{
			fmt.Println("datasource docs not found")
		}
		
		prog:=progressbar.New(len(filesR)+len(filesD))
		for _,f:=range filesR{
			go func(name string){
				defer func(){
					if r:=recover();r!=nil{
						if verboseError{
							fmt.Printf("\rpaniced while scanning r Docs %s error was:\n    %v\n    %s\n",name,r,debug.Stack())
						}else{
							fmt.Printf("\rpaniced while scanning r Docs %s error was:\n    %v\n",name,r)
						}

						completed <- false
					}else{
						completed <- true
					}
				}()
				cont,err:=ioutil.ReadFile(filepath.Join(docsPath,"r",name))
				if err!=nil{
					panic("couldnt open file")
				}
				key,value:=docs.GenerateDocumentStructure(cont)
				mx.Lock()
				docsR[key]=value
				mx.Unlock()
			}(f.Name())
		}
		for _,f:=range filesD{
			go func(name string){
				defer func(){
					if r:=recover();r!=nil{
						if verboseError{
							fmt.Printf("\rpaniced while scanning d Docs %s error was:\n    %v\n    %s\n",name,r,debug.Stack())
						}else{
							fmt.Printf("\rpaniced while scanning d Docs %s error was:\n    %v\n",name,r)
						}
						completed <- false
					}else{
						completed <- true
					}
				}()
				cont,err:=ioutil.ReadFile(filepath.Join(docsPath,"d",name))
				if err!=nil{
					panic("couldnt open file")
				}
				key,value:=docs.GenerateDocumentStructure(cont)
				mx.Lock()
				docsD[key]=value
				mx.Unlock()
			}(f.Name())
		}
		
		failed:=0
		for i:=0;i<len(filesR)+len(filesD);i++{
			if !<-completed {
				failed++
			}
			prog.Add(1)
		}
		prog.Finish()
		fmt.Println("\nfailed:",failed,"\n")
	}

	fmt.Println("##load json")
	jsonConfigs:=make(map[string]jsonConfig)
	var provJConf jsonConfigGeneratable
	if c,err:=ioutil.ReadDir(confPath);err==nil{
		for _,v:=range c{
			if j,err:=ioutil.ReadFile(filepath.Join(confPath,v.Name()));err==nil{
				if v.Name()=="_provider.json"{
					json.Unmarshal(j,&provJConf)
				}else{
					var x jsonConfig
					json.Unmarshal(j,&x)
					jsonConfigs[v.Name()]=x
				}
			}else{
				fmt.Printf("failed opening Jconfig %s\n",v.Name())
			}
		}
	}

	
	
	fmt.Println("## generating provider")
	provConfig:=ProviderConfig{
		Conf:GenerateS(name,name,provider.Schema,provJConf,docP),
	}
	provConfig.Interfaces=dedupeAttributeInterfaces(provConfig.Conf.Attributes)

	fmt.Println("## generating resources & datasources")
	prog:=progressbar.New(len(provider.ResourcesMap)+len(provider.DataSourcesMap))
	for k,v:=range resources{
		go func(k string, v map[string]string){
			
			groupJson,ok:=jsonConfigs[k+".json"]
			if !ok{
				groupJson=jsonConfig{}
			}
			for k2,v2:=range v{
				go func(k2 string,v2 string){
					defer func(){
						if r:=recover();r!=nil{
							if verboseError{
								fmt.Printf("\rpaniced while creating resource %s.%s error was:\n    %v\n    %s\n",k,k2,r,debug.Stack())
							}else{
								fmt.Printf("\rpaniced while creating resource %s.%s error was:\n    %v\n",k,k2,r)
							}
							completed <- false
						}else{
							completed <- true
						}
					}()
					
					doc:=docs.DocStructure{}
					if v,ok:=docsR[v2];ok{
						doc=v
					}
					
					json,ok:=groupJson.Resources[k2]
					if !ok{
						json=jsonConfigGeneratable{}
					}
					c:=GenerateS(k2,v2,provider.ResourcesMap[v2].Schema,json,doc)

					for k,v:=range json.ChildResources{
						for _,v:=range v{
							for i:=0;;i++{
								mx.Lock()
								if c2,ok:=fileConf[k];ok{
									if c2,ok:=(*c2)[v];ok{
										if c.Children==nil{
											c.Children=make([]*Config,0,1)
										}
										c.Children=append(c.Children,c2.Resource)
										mx.Unlock()
										break
									}
								}
								mx.Unlock()
								time.Sleep(time.Millisecond*100)
								if i>10{
									panic(fmt.Errorf("cannot find resource %s.%s in 10 cycles",k,v))
								}
							}
						}
					}

					c.Path=strcase.ToCamel(k)+"/"+strcase.ToLowerCamel(k2)

					mx.Lock()
					e,ok:=fileConf[k]
					if !ok{
						fc:=make(map[string]*FileConfig,0)
						e=&fc
						fileConf[k]=e
					}

					if e2,ok:=(*e)[k2];ok{
						e2.Resource=&c
					}else{
						(*e)[k2]=&FileConfig{
							Resource:&c,
						}
					}
					mx.Unlock()
				}(k2,v2)
			}
		}(k,v)
	}
	for k,v:=range datasources{
		go func(k string, v map[string]string){
			groupJson,ok:=jsonConfigs[k+".json"]
			if !ok{
				groupJson=jsonConfig{}
			}
			for k2,v2:=range v{
				go func(k2 string,v2 string){
					defer func(){
						if r:=recover();r!=nil{
							if verboseError{
								fmt.Printf("\rpaniced while creating datasource %s.%s error was:\n    %v\n    %s\n",k,k2,r,debug.Stack())
							}else{
								fmt.Printf("\rpaniced while creating datasource %s.%s error was:\n    %v\n",k,k2,r)
							}

							completed <- false
						}else{
							completed <- true
						}
					}()

					json,ok:=groupJson.Datasources[k2]
					if !ok{
						json=jsonConfigGeneratable{}
					}
					
					doc:=docs.DocStructure{}
					if v,ok:=docsR[v2];ok{
						doc=v
					}
					
					c:=GenerateS(k2,v2,provider.DataSourcesMap[v2].Schema,json,doc)
					
					for k,v:=range json.ChildResources{
						for _,v:=range v{
							for i:=0;;i++ {
								mx.Lock()
								if c2,ok:=fileConf[k];ok{
									if c2,ok:=(*c2)[v];ok{
										if c.Children==nil{
											c.Children=make([]*Config,0,1)
										}
										c.Children=append(c.Children,c2.Resource)
										mx.Unlock()
										break
									}
								}
								mx.Unlock()
								time.Sleep(time.Millisecond*100)
								if i>10{
									panic(fmt.Errorf("cannot find resource %s.%s in 10 cycles",k,v))
								}
							}
						}
					}
					c.Path=strcase.ToCamel(k)+"/"+strcase.ToLowerCamel(k2)
					
					mx.Lock()
					e,ok:=fileConf[k]
					if !ok{
						fc:=make(map[string]*FileConfig,0)
						e=&fc
						fileConf[k]=e
					}

					if e2,ok:=(*e)[k2];ok{
						e2.DataSource=&c
					}else{
						(*e)[k2]=&FileConfig{
							DataSource:&c,
						}
					}
					mx.Unlock()
				}(k2,v2)
			}
		}(k,v)
	}
	failed:=0
	for i:=0;i<len(provider.ResourcesMap)+len(provider.DataSourcesMap);i++{
		if !<-completed {
			failed++
		}		
		prog.Add(1)
	}
	prog.Finish()
	for _,v:=range fileConf{
		for _,v:=range *v{
			fileConfFillInterfaces(v)
		}
	}
	fmt.Println("\nfailed:",failed,"\n")
	return provConfig,fileConf
}
func fileConfFillInterfaces(c *FileConfig){

	var resAtt []*attribute.Interface
	if c.Resource!=nil{
		resAtt=dedupeAttributeInterfaces(c.Resource.Attributes,c.Resource.Comp)
	}
	var dataAtt []*attribute.Interface
	if c.DataSource!=nil{
		dataAtt=dedupeAttributeInterfaces(c.DataSource.Attributes,c.DataSource.Comp)
	}
	
	resMap:=make(map[string]*attribute.Interface,len(resAtt))
	out:=make([]*attribute.Interface,0,len(resAtt))
	for _,v:=range resAtt{
		resMap[v.Name]=v
		out=append(out,v)
	}
	for _,d:=range dataAtt{
		if r,ok:=resMap[d.Name];ok{
			if d.Equals(r){
				*d=*r
				continue
			}else{
				d.Name="D"+d.Name
			}
		}
		out=append(out,d)
	}
	c.Interfaces=out
	
}

func GenerateS(name string,identifier string,schem map[string]*schema.Schema,jsonConfig jsonConfigGeneratable, doc docs.DocStructure) Config{
	
	var identAttr []string
	attr,comp:=schemaToAttributes(schem, &doc, nil)
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
	c:=Config{
		Comment:doc.Text,
		Name:strcase.ToCamel(name),
		Identifier:identifier,
		Attributes:attr,
		Comp:comp,
		IdentAttr:identAttr,
		Provides:jsonConfig.Provides,
		Inherits:jsonConfig.Inherits,
	}
	
	return c
}

func generateNameHierarchy(providerName string, resources map[string]*schema.Resource,datasources map[string]*schema.Resource, verbose bool) (map[string]map[string]string,map[string]map[string]string){
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
		if verbose{fmt.Println(key+":")}
		for _,v2:=range v{
			name:=strings.TrimPrefix(strings.TrimPrefix(v2,prefix),"_")
			identifier:=providerName+"_"+key
			if name!=""{
				identifier+="_"+name
			}else{
				name=key
			}
			if verbose{fmt.Println("r   ",name,"    :    ",identifier)}
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
				if verbose{fmt.Println("d   ",name,"    :    ",identifier)}
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
			if verbose{fmt.Println(key+":")}
			for _,v2:=range v{
				name:=strings.TrimPrefix(strings.TrimPrefix(v2,prefix),"_")
				identifier:=providerName+"_"+key
				if name!=""{
					identifier+="_"+name
				}else{
					name=key
				}
				if verbose{fmt.Println("d   ",name,"    :    ",identifier)}
				resD[key][name]=identifier
			}
		}
	}
	return resR,resD
}

