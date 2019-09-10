package docs

import (
	"regexp"
	"fmt"
	"strings"
)
var	mTitle=regexp.MustCompile(
	`(?m)`+
	`^#\s(.*)$\n`,
)
var	mH2=regexp.MustCompile(
	`(?m)`+
	`^##\s(.*)$\n`,
)
var mArg=regexp.MustCompile(
	`(?im)`+
	`^\* \x60`+
		`([^\x60]*)`+
	`\x60 (?:- )?\(`+
		`(Optional|Required)?`+
	`[,/]?`+
		`([^)]*)`+
	`\)`+
		`(.*(?:\n\n|(?:\n[^\n*]*))*)`,
)
var mAttr=regexp.MustCompile(
	`(?m)`+
	`^\* \x60`+
		`([^\x60]*)`+
	`\x60 (?:- )?`+
		`(.*(?:\n\n|(?:\n[^\n*]*))*)`,
)
var mBlock=regexp.MustCompile(
	`(?im)`+
	`^(`+
		`(?:`+
			`[^*\n]*\*{2}(`+
				`[^*]*`+
			`)\*{2}`+
		`|`+
			`(?:[^*\n][^\x60\n]*|)\x60(`+
				`[^\x60]*`+
			`)\x60`+
		`)[^\n:]*`+
	`):?$\n\n(`+
		`(?:^\* \x60[^\x60]*\x60 (?:- )?\((?:Optional|Required)?,?[^)]*\) .*(?:\n\n|(?:\n[^\n*]*))*)+`+
	`)`,
)

func GenerateDocumentStructure(b []byte) (string,DocStructure){
	title:=""
	doc:=DocStructure{
		Arguments:make(map[string]DocArg),
		Blocks:make(map[string]DocBlock),
	}
	fTitle:=mTitle.FindAllSubmatchIndex(b,-1)
	if len(fTitle)==0{
		panic(fmt.Errorf("doc:title not found"))
	}
	title=string(b[fTitle[0][2]:fTitle[0][3]])
	title=strings.TrimPrefix(title,"Resource:")
	title=strings.TrimPrefix(title,"Data Source:")
	title=strings.TrimSpace(title)
	content:=b[fTitle[0][1]:]
	
	fH2:=mH2.FindAllSubmatchIndex(content,-1)
	if len(fH2)==0{
		panic(fmt.Errorf("doc: no subheaders found"))
	}
	doc.Text=string(content[:fH2[0][0]])
	for i,v:=range fH2{
		var end int
		if i<len(fH2)-1{
			end=fH2[i+1][0]
		}else{
			end=len(content)
		}
		title:=string(content[v[2]:v[3]])
		text:=content[v[1]:end]
		if title=="Argument Reference"{
			args,blocks:=getArgsNBlocks(text)
			for k,v:=range args {
				doc.Arguments[k]=v
			}
			for k,v:=range blocks {
				doc.Blocks[k]=v
			}
		}else if title=="Attributes Reference"{
			doc.Attributes= getAttrs(text)
		}else{
			doc.Text+=string(content[v[0]:end])
		}
	}
	return title,doc
}
func getArgsNBlocks(b []byte) (map[string]DocArg,map[string]DocBlock){
	blocks:=make(map[string]DocBlock)
	fBlocks:=mBlock.FindAllSubmatchIndex(b,-1)
	if fBlocks==nil{
		return getArgs(b),nil
	}
	for _,v:=range fBlocks{
		key,val:=getBlock(b,v)
		blocks[key]=val
	}
	args:=getArgs(b[:fBlocks[0][0]])
	return args,blocks
}
func getArgs(b []byte) map[string]DocArg{
	out:=make(map[string]DocArg)
	fArgs:=mArg.FindAllSubmatch(b,-1)
	for _,v:=range fArgs{
		out[string(v[1])]=DocArg{
			Req:strings.ToLower(string(v[2]))=="required",
			Bonus:strings.TrimSpace(string(v[3])),
			Text:strings.TrimSpace(string(v[4])),
		}
	}
	return out
}
func getAttrs(b []byte) map[string]string{
	out:=make(map[string]string)
	for _,v:=range mAttr.FindAllSubmatch(b,-1){
		out[string(v[1])]=strings.TrimSpace(string(v[2]))
	}
	return out
}
func getBlock(b []byte, subInd[]int) (string,DocBlock){
	block:=DocBlock{
		Text:string(b[subInd[2]:subInd[3]]),
		Arguments:getArgs(b[subInd[8]:subInd[9]]),
	}
	var name string
	if subInd[5]-subInd[4]!=0{
		name=string(b[subInd[4]:subInd[5]])
	}else{
		name=string(b[subInd[6]:subInd[7]])
	}
	return name,block
}
