package main

import (
	"flag"
	"path/filepath"
	"bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/generator"
	"github.com/terraform-providers/terraform-provider-aws/aws"
)

func main() {
	path:=flag.String("path","./dist","path to create module")
	confPath:=flag.String("conf","./config","path to configurationfiles")
	docsPath:=flag.String("docs","C:/Users/Roy Ammershuber/go/pkg/mod/github.com/terraform-providers/terraform-provider-aws@v1.60.0/website/docs","path to the folder containing docs")
	flag.Parse()
	outPath,_:=filepath.Abs(*path)
	cPath,_:=filepath.Abs(*confPath)
	dPath,_:=filepath.Abs(*docsPath)
	generator.Generate("aws", *aws.Provider(),outPath,cPath,dPath);
}