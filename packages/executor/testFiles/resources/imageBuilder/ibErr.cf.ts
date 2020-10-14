export const i1=new ImageBuilder.Image()
    .testConfig(true,1441)
export const i2=new ImageBuilder.Image()
    .InfrastructureConfig(new ImageBuilder.InfrastructureConfig())
    .distributionConfig(new ImageBuilder.DistributionConfig())
    .Recipe(new ImageBuilder.Recipe())
    .testConfig(true,59)
export const ip1=new ImageBuilder.ImagePipeline()
    .testConfig(true,1441)
export const ip2=new ImageBuilder.ImagePipeline()
    .testConfig(true,59)
export const r1=new ImageBuilder.Recipe()
    .Components(
        new ImageBuilder.Component(),
        new ImageBuilder.Component()
            .uri("true")
            .phase("validate",[
                new ImageBuilder.Component.Step.S3Download(),
                new ImageBuilder.Component.Step.S3Upload(),
                new ImageBuilder.Component.Step.SetRegistry(),
            ])
        )