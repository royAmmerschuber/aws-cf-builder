
export const emptyBucket=new S3.Bucket()
export const bucket1=new S3.Bucket()
    .name("ichi")
    .accelerateConfig("Enabled")
    .accessControl("Private")
    .analyticsConfig(
        new S3.Bucket.AnalyticsConfig()
            .SchemaVersion("V_1")
            .Id("ni")
            .Destination("arn:aws:s3:::san"),
        new S3.Bucket.AnalyticsConfig()
            .SchemaVersion("V_1")
            .Id("yon")
            .Destination("arn:aws:s3:::go","roku/nana/","890123456")
            .outputFormat("CSV")
            .prefix("jyuuNana")
            .tagFilters({
                jyuuHachi:"jyuuKyuu",
                niJyuu:"niJyuuIchi",
            })
            .tagFilters("niJyuuNi","niJyuuSan")
    )
    .corsRule(
        new S3.Bucket.CorsRule()
            .AllowedMethods("GET")
            .AllowedOrigins("*"),
        new S3.Bucket.CorsRule()
            .AllowedMethods("DELETE","HEAD","PUT","POST")
            .AllowedOrigins("niJyuuYon.com","niJyuuGo.de")
            .allowedHeaders("niJyuuRoku","niJyuuNana")
            .exposedHeaders("niJyuuNana")
            .id("niJyuuHachi")
            .maxAge(290)
    )
    .encryption("AES256")
    .inventoryConfigs(
        new S3.Bucket.InventoryConfig()
            .Destination("arn:aws:s3:::SanJyuuNi")
            .Id("niJyuuSan")
            .IncludedVersions("Current")
            .Frequency("Weekly"),
        new S3.Bucket.InventoryConfig()
            .Destination("arn:aws:s3:::niJyuuYon","ni/jyuu/go/","2567890123")
            .Id("sanJyuuYon")
            .IncludedVersions("All")
            .enabled(false)
            .outputFormat("CSV")
            .prefix("/sanJyuu/Nana")
            .optionalFields("sanJyuuGo","sanJyuuRoku")
            .Frequency("Weekly")
    )
    .lifecycleRule(
        new S3.Bucket.LifecycleRule()
            .abortIncompleteMultipartUpload(37),
        new S3.Bucket.LifecycleRule()
            .expiration("date","2019-10-20"),
        new S3.Bucket.LifecycleRule()
            .noncurrentVersionExpiration(38),
        new S3.Bucket.LifecycleRule()
            .noncurrentVersionTransitions("DEEP_ARCHIVE",39),
        new S3.Bucket.LifecycleRule()
            .transitions("days","GLACIER",40),
        new S3.Bucket.LifecycleRule()
            .id("yonJyuuIchi")
            .status("Disabled")
            .prefix("yonJyuu/Go/")
            .tagFilters({
                yonJyuuRoku:"yonJyuuNana",
                yonJyuuHachi:"yonJyuuKyuu"
            })
            .abortIncompleteMultipartUpload(6)
            .expiration("date","2020-02-20")
            .transitions("date","INTELLIGENT_TIERING","2020-03-01")
            .transitions("date","GLACIER","2020-04-01")
            .noncurrentVersionExpiration(42)
            .noncurrentVersionTransitions("DEEP_ARCHIVE",43)
            .noncurrentVersionTransitions("GLACIER",44),
        new S3.Bucket.LifecycleRule()
            .transitions("days","DEEP_ARCHIVE",50)
            .transitions("days","GLACIER",51)
            .expiration("days",52)
    )
    .loggingConfig("arn:aws:s3:::goJyuuIchi","goJyuu/ni/")
    .metricsConfigs("rokuJyuuSan")
    .metricsConfigs("goJyuuYon","goJyuu/Go/",{
        goJyuuRoku:"goJyuuNana",
        goJyuuHachi:"goJyuuKyuu"
    })
    .metricsConfigs("rokuJyuu","",[
        {key:"rokuJyuuIchi",value:"rokuJyuuNi"}
    ])
    .notificationConfig(
        new S3.Bucket.Notification.Lambda()
            .Event("s3:ObjectCreated:*")
            .Function("arn:aws:lambda:::function/rokuJyuuSan"),
        new S3.Bucket.Notification.Queue()
            .Event("s3:ObjectRemoved:*")
            .Queue("arn:aws:sqs:::queue/rokuJyuuYon"),
        new S3.Bucket.Notification.Topic()
            .Event("s3:ReducedRedundancyLostObject")
            .Topic("arn:aws:sns:::topic/rokuJyuuGo"),
        new S3.Bucket.Notification.Lambda()
            .Event("s3:Replication:OperationFailedReplication")
            .Function("arn:aws:lambda:::function/rokuJyuuRoku")
            .keyFilter("prefix","rokuJyuu/Nana/")
            .keyFilter("suffix",".Hachi"),
        {
            Queue:"arn:aws:sqs:::queue/rokuJyuuKyuu",
            Event:"nonStandardEvent",
            //@ts-ignore
            somethingSlightly:"Different"
        },
        {
            Topic:"arn:aws:sns:::topic/nanaJyuu",
            Event:"nonStandardEvent",
            //@ts-ignore
            somethingSlightly:"Different"
        },
        {
            Function:"arn:aws:lambda:::function/nanaJyuuIchi",
            Event:"nonStandardEvent",
            //@ts-ignore
            somethingSlightly:"Different"
        },
    )
    .notificationConfig("Lambda",{something:["completely","different"]})
    .notificationConfig("Queue",{something:["completely","different"]})
    .notificationConfig("Topic",{something:["completely","different"]})
    .objectLockConfig(true,"GOVERNANCE",72)
    .publicAccessBlockConfig("blockPublicAcls","blockPublicPolicy")
    .publicAccessBlockConfig({
        ignorePublicAcls:false
    })
    .replicationRole("arn:aws:iam:::role/nanaJyuuSan")
    .replicationRules(
        new S3.Bucket.ReplicationRule()   
            .Id("nanaJyuuYon")
            .Prefix("nanaJyuu/Go/")
            .Destination("arn:aws:s3:::nanaJyuuRoku"),
        new S3.Bucket.ReplicationRule()
            .Id("nanaJyuuNana")
            .Prefix("nanaJyuu/Hachi")
            .Destination("arn:aws:s3:::nanaJyuuKyuu","DEEP_ARCHIVE")
            .destinationEncryption("arn:aws:kms:::key/hachiJyuu")
            .destinationOwner("5748290753429")
            .status("Disabled")
            .sseKmsEncyptedReplication("Disabled")
    )
    .versioningConfig("Enabled")
    .websiteConfig(new S3.Bucket.WebsiteConfiguration()
        .errorDocument("hachiJyuuGo.html")
        .indexDocument("index.html")
        .routingRules(
            new S3.Bucket.RoutingRule(),
            new S3.Bucket.RoutingRule()
                .hostName("hachiJyuuNana.com")
                .protocol("http")
                .redirectCode("487")
                .replace("key","hachiJyuuHachi")
                .condition("errorCode","200")
                .condition("prefix","hachiJyuuKyuu"),
            new S3.Bucket.RoutingRule()
                .replace("prefix","kyuuJyuu")
                .condition("prefix","kyuuJyuu/Ichi")
        ))
    .tag({
        hachiJyuuIchi:"hachiJyuuNi",
        hachiJyuuSan:"hachiJyuuYon"
    })
export const bucket2=new S3.Bucket()
    .encryption("aws:kms","372893723-3823824-38294-318938291")
    .loggingConfig("arn:aws:s3:::goJyuuSan")
    .websiteConfig(new S3.Bucket.WebsiteConfiguration())
export const bucket3=new S3.Bucket()
    .websiteConfig(new S3.Bucket.WebsiteConfiguration()
        .redirectAllRequestsTo("hachiJyuuRoku.com"))
export const bucket4=new S3.Bucket()
    .websiteConfig(new S3.Bucket.WebsiteConfiguration()
        .redirectAllRequestsTo("hachiJyuuRoku.com","https"))