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
	flag.Parse()
	generator.Path,_=filepath.Abs(*path)
	generator.ConfPath,_=filepath.Abs(*confPath)
	generator.Generate("aws", *aws.Provider());
}