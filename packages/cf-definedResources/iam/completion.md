# Policy
 ## maps to
 AWS::IAM::Policy
 ## definitions
 ### defined in Class
  - **PolicyDocument**: _PolicyDocument_
  - **PolicyName**
  - **Roles** _(or Group or Users)_
  - **Groups** _(or Roles or Users)_
  - **Users** _(or Group or Roles)_
 ## components
  - PolicyDocument

# *virtual* PolicyDocument
 ## definitions
 ### defined in class
  - **Version**
  - Id
  - **Statement**: _PolicyStatement_
 ## components
  - PolicyStatement

# *virtual* PolicyStatement
 ## definitions
 ### defined in Class
  - Sid
  - **Effect**
  - Principal _(or not)_
  - NotPrincipal
  - **Action** _(or not)_
  - NotAction
  - **Resource** _(or not)_
  - NotResource
 ### not implemented
  - Condition

# Role
 ## maps to
 AWS::IAM::Role
 ## definitions
 ### sub Resources
  - Policy
 ### references
  - ManagedPolicy
 ### defined in Class
  - **AssumeRolePolicyDocument**: _PolicyDocument_
  - Policies: - _PolicyDocument_
  - RoleName
  - MaxSessionDuration
  - ManagedPolicyArns
  - Path
  - PermissionsBoundary
 ## components
  - PolicyDocument

# Group
 ## maps to
 AWS::IAM::Group
 ## definitions
 ### sub Resources
  - Policy
  - UTG
 ### references
  - ManagedPolicy
 ### defined in Class
  - GroupName
  - ManagedPolicyArns
  - Path
  - Policies
 ## components
  - PolicyDocument

# UTG
 ## maps to
 AWS::IAM::UserToGroupAddition
 ## definitions
 ### references
  - User
 ### defined in Class
  - Users
 ### inherit from parent
  - GroupName

# User
 ## maps to
 AWS::IAM::User
 ## definitions
 ### sub Resources
  - Policy
  - AccessKey
 ### references
  - ManagedPolicy
 ### defined in Class
  - Path
  - UserName
  - Policies
  - ManagedPolicyArns
  - Groups
  - LoginProfile
  - PermissionsBoundary
 ## components
  - PolicyDocument

# AccessKey
 ## maps to
 AWS::IAM::User
 ## definitions
 ### defined in Class
  - State
  - Status
 ### inherit from parent
  - UserName

# ManagedPolicy
 ## maps to
 AWS::IAM::ManagedPolicy
 ## definitions
 ### defined in Class
  - Description
  - Groups
  - Path
  - **PolicyDocument**
  - Roles
  - Users
  - ManagedPolicyName
 ## components
  - PolicyDocument