const policy=new SQS.QueuePolicy()
    .Document({
        Version:"2012-10-17",
        Statement:[]
    })
export const deadLetter=new SQS.Queue()
    .fifoQueue()
    .policy(policy)
export const queue=new SQS.Queue()
    .contentBasedDeduplication()
    .delaySeconds(20)
    .fifoQueue()
    .kmsMasterKey("Drei",60)
    .maximumMessageSize(2048)
    .messageRetentionPeriod(345_600)
    .name("Vier")
    .receiveMessageWaitTime(5)
    .redrivePolicy(deadLetter,4)
    .tag("paul","peter")
    .tag({
        pedro:"petra"
    })
    .visibilityTimeout(30)
    .policy(
        policy,
        {
            Version:"2012-10-17",
            Statement:[{ Effect:"Allow" }]
        }
    )
export const queueEmpty=new SQS.Queue()