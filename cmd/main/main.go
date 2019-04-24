package main

import (
	"flag"
	"path/filepath"
	"bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/generator"
	"github.com/terraform-providers/terraform-provider-aws/aws"
)

func main() {
	path:=flag.String("path","./tmp","path to create module")
	
	flag.Parse()
	generator.Path,_=filepath.Abs(*path)
	generator.Generate("aws", *aws.Provider());
}