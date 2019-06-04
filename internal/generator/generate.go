package generator

import (
	"fmt"
	"os"
	"path/filepath"
	"github.com/schollz/progressbar/v2"
	"github.com/hashicorp/terraform/helper/schema"
	"bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/config"
	"github.com/iancoleman/strcase"
)
var GeneralPath string ="../../js/general/"
var Perm os.FileMode=0777

func Generate(name string, provider schema.Provider,outPath,ConfPath string,DocsPath string) {
	provConf,resConf:=config.GenerateProvider(name,provider,ConfPath,DocsPath)
	provPath:=filepath.Join(outPath,name)
	os.RemoveAll(provPath)
	os.MkdirAll(provPath,Perm)
	generateProvider(provPath,provConf)
	completed:=make(chan bool)
	fmt.Println("# generating Files from Config:")
	prog:=progressbar.New(len(resConf))
	for k,v:=range resConf{
		go func(k string,v *map[string]*config.FileConfig){
			defer func(){
				if r:=recover();r!=nil{
					fmt.Printf("\rpaniced while creating ResourceGroup %s. error was: %v\n",k,r)
					completed<-false
				}else{
					completed<-true
				}
			}()
			os.Mkdir(filepath.Join(provPath,strcase.ToCamel(k)),Perm)
			for k2,v2:=range (*v){
				generateResourceFile(filepath.Join(provPath,strcase.ToCamel(k),strcase.ToLowerCamel(k2)+".ts"),v2)
			}
			
		}(k,v)
	}
	failed:=0
	for i:=0;i<len(resConf);i++{
		if !<-completed{
			failed++
		}
		prog.Add(1)
	}
	prog.Finish()
	fmt.Println("\nfailed:",failed,"\n")
}