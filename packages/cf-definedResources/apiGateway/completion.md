# Api
 ## maps to
 AWS::ApiGateway::RestApi
 ## definitions
 ### sub Resources
  - ApiResource
  - Method
  - deployments
 ### references
  - none
 ### defined in Class
  - **Name**
  - ApiKeySourceType
  - BinaryMediaTypes
  - Body
  - BodyS3Location
  - Description
  - EndpointConfiguration
  - FailOnWarnings
  - Policy
 ### inherit from parent
  - none
 ### not implemented
  - MinimumCompressionSize
  - Parameters
  - CloneFrom
 ## notes
  - none

# ApiResource
 ## maps to
 AWS::ApiGateway::Resource
 ## definitions
 ### sub Resources
 ### references
 ### defined in Class
 - **PathPart**
 ### inherit from parent
 - **ParentId**
 - **RestApiId**
 ### not implemented
 ## notes
  - none

# deployment
 ## maps to
 API::ApiGateway::Deployment
 ## definitions
  ### sub Resources
   - none
  ### references
   - None
  ### defined in Class
   - StageDescription
       - AccessLogSetting
           - DestinationArn: String
           -Format: String
       - CacheClusterEnabled
       - CacheClusterSize
       - CacheDataEncrypted
       - CacheTtlInSeconds
       - CachingEnabled
       - CanarySetting
           - PercentTraffic
           - StageVariableOverrides
           - UseStageCache
       - ClientCertificateId
       - DataTraceEnabled
       - Description
       - LoggingLevel
       - MethodSettings
           - - CacheDataEncrypted
             - CacheTtlInSeconds
             - CachingEnabled
             - DataTraceEnabled
             - HttpMethod
             - LoggingLevel
             - MetricsEnabled
             - ResourcePath
             - ThrottlingBurstLimit
             - ThrottlingRateLimit
       - MetricsEnabled
       - Tags
       - ThrottlingBurstLimit
       - ThrottlingRateLimit
       - TracingEnabled
       - Variables
   - DeploymentCanarySettings
       - PercentTraffic
       - StageVariableOverrides
       - UseStageCache
   - Description
   - StageName
  ### inherit from parent
   - **RestApiId**
  ### not implemented
   - none
 ## notes
  - requires serious improvements most properties are in sub object and are not made easier or documented

# *abst* Method
 ## maps to
  AWS::ApiGateway:Method
 ## definitions
  ### sub Resources
   - none
  ### references
   - Authorizer
   - Models
   - (LambdaMethod) LambdaFunction
  ### defined in Class
   - ApiKeyRequired
   - OperationName
   - Integration
       - CacheKeyParameters
       - CacheNamespace
       - ConnectionId
       - ConnectionType
       - ContentHandling
       - Credentials
       - IntegrationHttpMethod
       - IntegrationResponses
           - ContentHandling
           - ResponseParameters
           - ResponseTemplates
           - SelectionPattern
           - StatusCode
       - PassthroughBehavior
       - RequestParameters
       - RequestTemplates
       - Type
       - TimeoutInMillis
       - Uri
   - MethodResponses
       - - ResponseModels
         - ResponseParameters
         - StatusCode
   - AuthorizationScopes
   - **AuthorizationType**
   - AuthorizerId
  ### inherit from parent
   - **HttpMethod**
   - **RestApiId**
   - **ResourceId**
  ### not implemented
   - RequestModels
   - RequestParameters
   - RequestValidatorId
 ## notes
  - integration currently get implemented by child classes

# Model
 ## maps to
 AWS::ApiGateway::Model
 ## definitions
  ### sub Resources
   - None
  ### references
   - None
  ### defined in Class
   - **ContentType**
   - **Schema**
   - Description
   - Name
  ### inherit from parent
   - **RestApiId**
  ### not implemented
   - None
 ## notes
  - none

# Authorizer
 ## maps to
 AWS::ApiGateway::Resource
 ## definitions
 ### sub Resources
 ### references
  - any
 ### defined in Class
  - **IdentitySource**
  - **Name**
  - **Type**
  - ProviderARNs
  - AuthorizerResultTtlInSeconds
 ### inherit from parent
  - **RestApiId**
 ### not implemented
  - AuthType
  - AuthorizerUri
  - AuthorizerCredentials
  - IdentityValidationExpression
 ## notes
  - none
