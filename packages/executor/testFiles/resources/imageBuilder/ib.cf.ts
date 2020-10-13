import { ReferenceField } from "aws-cf-builder-core/fields/referenceField"
import { CronExpression } from "aws-cf-builder-defined-resources/cloudwatch/rule/cron"
import { InstanceProfile } from "aws-cf-builder-defined-resources/iam/instanceProfile"

export const i1=new ImageBuilder.Image()
    .InfrastructureConfig(new ImageBuilder.InfrastructureConfig()
        .Name("infrastruct")
        .instanceTypes("r4.16xlarge","x1e.32xlarge")
        .keyPair("someKey")
        .resourceTag("paul","meier")
        .resourceTag({
            henry:"Ford",
            paul:"klee"
        })
        .s3Log("s3://bucket/path/key/prefix")
        .InstanceProfile(new InstanceProfile()
            .Role("role"))
        .securityGroups(
            "group",
            new EC2.SecurityGroup()
                .Description("yo")
        )
        .snsTopic("someTopic")
        .subnet("subnetId")
        .tag("paul2","meier2")
        .tag({
            henry2:"Ford2",
            paul2:"klee2"
        })
        .terminateOnFailure())
    .enhandedMetadata()
    .distributionConfig(new ImageBuilder.DistributionConfig()
        .Name("dist")
        .description("bla")
        .Distributions(new ReferenceField("someRegion"),
            new ImageBuilder.DistributionConfig.AmiDistribution()
                .accountPermissions("account-id","account-id2","account-id3")
                .description("someText")
                .groupPermissions("groupA","groupB")
                .kmsKey("id")
                .name("yolo")
                .targetAccounts("someAcc","otherAcc")
                .tag("pedro","meier4")
                .tag({
                    henry4:"Ford4",
                    paul4:"klee4"
                }),
            ["c","b","a"])
        .Distributions(new ReferenceField("otherRegion"),
            new ImageBuilder.DistributionConfig.AmiDistribution()
        )
        .Distributions("eu-south-1")
        .Distributions({
            "us-east-2":{
                dist:{
                    description:"greatText",
                    name:"stupidName"
                },
                licenses:["a","b","c"]
            },
            "af-south-1":{ }
        })
        .tag("pedro","meier5")
        .tag({
            henry5:"Ford5",
            paul5:"klee5"
        }))
    .testConfig(true,60)
    .Recipe(new ImageBuilder.Recipe()
        .Name("test")
        .Version("1.0.0")
        .ParentImage("someImage")
        .Components(
            new ImageBuilder.Component()
                .Name("a")
                .Platform("Linux")
                .Version("1.0.0")
                .description("greatStuff")
                .changeDescription("peter")
                .kmsKey("keyeyey")
                .supportedOsVersions("4")
                .phase("build",[
                    new ImageBuilder.Component.Step.Execute("Binary","/bin/ls","{{ loop.value }}")
                        .name("paul")
                        .maxAttempts(4)
                        .onFailure("Continue")
                        .timeout(5)
                        .loopName("someName")
                        .forEach([
                            "/root",
                            "/home/ubuntu"
                        ]),
                    new ImageBuilder.Component.Step.Execute("PowerShell","C:\\test{{ loop.value }}.ps")
                        .forEach("a,b,c,d,e,f",","),
                    new ImageBuilder.Component.Step.Execute("Bash","C:\\test{{ loop.index }}.ps")
                        .for(0,10,3),
                    new ImageBuilder.Component.Step.Execute(new ReferenceField("bshOrPs"),[
                        "comm1",
                        "comm2",
                        "comm3"
                    ]),
                ])
                .phase(new ReferenceField("secondPhase"),[
                    new ImageBuilder.Component.Step.Reboot(5),
                    new ImageBuilder.Component.Step.S3Download("from","to")
                        .Transfer("s3","local"),
                    new ImageBuilder.Component.Step.S3Upload("from","to",true)
                        .Transfer("local","s3"),
                    new ImageBuilder.Component.Step.SetRegistry("/some/path","name","DWORD",["some","text"])
                        .Set("path","ident","QWORD",43),
                    new ImageBuilder.Component.Step.UpdateOS()
                        .exclude("blender","python3")
                        .include("libGl1"),
                    {
                        action:"Reboot",
                        name:"last",
                        inputs:{
                            delaySeconds:4
                        }
                    }
                ])
                .tag("pedro","meier4")
                .tag({
                    henry4:"Ford4",
                    paul4:"klee4"
                }),
            new ImageBuilder.Component()
                .Name("2")
                .Platform("Windows")
                .Version("1.0.1")
                .data(new JSONField({
                    stuff:"happening"
                })),
            new ImageBuilder.Component()
                .Name("3")
                .Platform("Windows")
                .Version("1.0.1")
                .uri("someUri"),
            "someArn")
        .description("cookieRecipe")
        .workingDirectory("/root/stuff")
        .blockDeviceMapping(
            {
                DeviceName:"/dev/sda",
                Ebs:{
                    DeleteOnTermination:true
                }
            },
            new ImageBuilder.Recipe.BlockDeviceMapping()
                .deviceName("/dev/sda")
                .remove(),
            new ImageBuilder.Recipe.BlockDeviceMapping()
                .deviceName("/dev/sdb")
                .virtualName("some-name")
                .deleteOnTermination()
                .encrypted()
                .iops(42)
                .kmsKey("someKey")
                .snapshotId("snap-id")
                .volumeSize(21)
                .volumeType("io2"),
            new ImageBuilder.Recipe.BlockDeviceMapping()
        )
        .tag("pedro","meier6")
        .tag({
            henry6:"Ford6",
            paul6:"klee6"
        }),
    )
    .tag("paul3","meier3")
    .tag({
        henry3:"Ford3",
        pedro:"klee3"
    })
export const i2=new ImageBuilder.Image()
    .InfrastructureConfig(new ImageBuilder.InfrastructureConfig()
        .Name("test")
        .InstanceProfile("profileArn"))
    .Recipe(new ImageBuilder.Recipe()
        .Name("pual")
        .Version("1.0.0")
        .ParentImage(i1)
        .Components("someComp"))
export const in1= new ImageBuilder.InfrastructureConfig()
    .Name("test")
    .s3Log("bucket",new ReferenceField("someRef"))
    .InstanceProfile(new Iam.Role()
        .AssumePolicy("*")
        .instanceProfile())
export const ip1=new ImageBuilder.ImagePipeline()
    .Name("somePipe")
    .InfrastructureConfig("configArn")
    .Recipe("recipeArn")
    .description("someText")
    .distributionConfig("configArn")
    .enabled(true)
    .enhandedMetadata()
    .schedule(
        new CronExpression()
            .dayOfWeek("MON")
            .hours(5)
            .minutes(0),
        "EXPRESSION_MATCH_ONLY"
    )
    .testConfig(false)
    .tag("paul7","meier4")
    .tag({
        henry4:"Ford4",
        paul4:"klee4"
    })
export const ip2=new ImageBuilder.ImagePipeline()
    .Name("pipeTsuo")
    .InfrastructureConfig("conf")
    .Recipe("rec")