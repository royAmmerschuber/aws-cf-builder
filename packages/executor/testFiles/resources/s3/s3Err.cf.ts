export const b=new S3.Bucket()
    .replicationRole("arn:aws:iam:::role/ichi")
    .analyticsConfig(new S3.Bucket.AnalyticsConfig())
    .corsRule(new S3.Bucket.CorsRule())
    .inventoryConfigs(new S3.Bucket.InventoryConfig())
    .lifecycleRule(
        new S3.Bucket.LifecycleRule(),
        new S3.Bucket.LifecycleRule()
            .expiration("days",2)
            .transitions("days","DEEP_ARCHIVE",3)
            .transitions("days","GLACIER",4)
            .transitions("date","INTELLIGENT_TIERING","2020-05-06")
    )
    .notificationConfig(
        new S3.Bucket.Notification.Lambda(),
        new S3.Bucket.Notification.Topic(),
        new S3.Bucket.Notification.Queue()
    )
    .websiteConfig(new S3.Bucket.WebsiteConfiguration()
        .redirectAllRequestsTo("nana.com")
        .errorDocument("error.html"))
    
export const b2=new S3.Bucket()
    .replicationRules(new S3.Bucket.ReplicationRule())