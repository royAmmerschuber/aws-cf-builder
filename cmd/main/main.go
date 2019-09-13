package main

import (
	"bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/encoding/json"
	"flag"
	"path/filepath"
	"github.com/terraform-providers/terraform-provider-aws/aws"
	"io/ioutil"
	"fmt"
	"github.com/schollz/progressbar/v2"
	"os"
)
func main() {
	check:=func(e error){
		if e!= nil{
			panic(e)
		}
	}
	path:=flag.String("path","./baseData","path to create module")
	flag.String("docs","C:/Users/Roy Ammershuber/go/pkg/mod/github.com/terraform-providers/terraform-provider-aws@v1.60.0/website/docs","path to the folder containing docs")
	flag.Parse()
	outPath,_:=filepath.Abs(*path)
	provider :=aws.Provider()
	os.RemoveAll(outPath)
	os.MkdirAll(filepath.Join(outPath,"resources"),0644)
	os.MkdirAll(filepath.Join(outPath,"datasources"),0644)
	providerJSON,err:=json.MarshalIndent(provider.Schema,"","    ")
	check(err)
	err=ioutil.WriteFile(filepath.Join(outPath,"provider.json"),providerJSON,0644)
	check(err)
	p:=progressbar.New(len(provider.ResourcesMap))
	for k,v:=range provider.ResourcesMap{
		path:=filepath.Join(outPath,"resources",k+".json")
		resourceJSON,err:=json.MarshalIndent(v,"","    ")
		check(err)
		err=ioutil.WriteFile(path,resourceJSON,0644)
		check(err)
		p.Add(1)
	}
	p.Finish()
	fmt.Println()
	p=progressbar.New(len(provider.DataSourcesMap))
	for k,v:=range provider.DataSourcesMap{
		path:=filepath.Join(outPath,"datasources",k+".json")
		resourceJSON,err:=json.MarshalIndent(v,"","    ")
		check(err)
		err=ioutil.WriteFile(path,resourceJSON,0644)
		p.Add(1)
	}
	p.Finish()
}