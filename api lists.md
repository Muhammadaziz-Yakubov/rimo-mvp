/integration-docs/doc.json  
Explore  
api.hisobot.gov.uz Integration API  
 1.0   
OAS 2.0  
\[ Base URL: api.hisobot.gov.uz/ \]  
/integration-docs/doc.json  
Swagger UI: /integration-docs is protected with HTTP Basic Auth — use your integration username and password issued for API access.  
API calls: POST /integration/auth/login with JSON username/password returns a Bearer access token (and refresh token). Use Authorize (Bearer) for /integration/v2/\*. Obtain credentials through the cabinet or authority UI (not documented in this spec).

Authorize  
integration-auth

POST  
/integration/auth/login  
Integration login (username / password)

Same username/password as for /integration-docs Basic Auth. Response includes access\_token (Bearer JWT, 15m TTL) and refresh\_token (opaque, 30d). Authorize with the access token for /integration/v2/\*; rotate via POST /integration/v2/auth/refresh with Bearer \+ JSON refresh\_token.

Parameters  
Try it out  
Name	Description  
body \*  
object  
(body)  
Integration credentials

Example Value  
Model  
{  
  "password": "string",  
  "username": "string"  
}  
Parameter content type

application/json  
Responses  
Response content type

application/json  
Code	Description  
200	  
OK

Example Value  
Model  
{  
  "access\_token": "string",  
  "expires\_in": 0,  
  "refresh\_expires\_in": 0,  
  "refresh\_token": "string",  
  "token\_type": "string"  
}  
400	  
Bad Request

Example Value  
Model  
{  
  "additionalProp1": {}  
}  
401	  
Unauthorized

Example Value  
Model  
{  
  "additionalProp1": {}  
}

POST  
/integration/v2/auth/refresh  
Refresh integration access token

Send {"refresh\_token":"..."} in the body — no Authorization header is required, the refresh token works even after the access token expires. Returns a new access token and refresh token; the previous refresh token is marked as used (refreshed).

Parameters  
Try it out  
Name	Description  
body \*  
object  
(body)  
Current refresh token

Example Value  
Model  
{  
  "refresh\_token": "string"  
}  
Parameter content type

application/json  
Responses  
Response content type

application/json  
Code	Description  
200	  
OK

Example Value  
Model  
{  
  "access\_token": "string",  
  "expires\_in": 0,  
  "refresh\_expires\_in": 0,  
  "refresh\_token": "string",  
  "token\_type": "string"  
}  
400	  
Bad Request

Example Value  
Model  
{  
  "additionalProp1": {}  
}  
401	  
Unauthorized

Example Value  
Model  
{  
  "additionalProp1": {}  
}  
integration-api

GET  
/integration/v2/authorities  
List authorities (integration JWT)

Same as GET /v2/authorities.

Parameters  
Try it out  
Name	Description  
with  
string  
(query)  
Relations to include (e.g. category)

with  
Responses  
Response content type

application/json  
Code	Description  
200	  
OK

Example Value  
Model  
\[  
  {  
    "active": true,  
    "category": {  
      "active": true,  
      "code": "string",  
      "created\_at": "string",  
      "id": 0,  
      "order": 0,  
      "title": {  
        "en": "string",  
        "kaa": "string",  
        "ru": "string",  
        "uz": "string"  
      },  
      "updated\_at": "string"  
    },  
    "category\_id": 0,  
    "code": "string",  
    "created\_at": "string",  
    "icon\_url": "string",  
    "id": 0,  
    "order": 0,  
    "tin": 0,  
    "title": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "updated\_at": "string"  
  }  
\]

GET  
/integration/v2/authorities/{id}  
Get authority by ID (integration JWT)

Parameters  
Try it out  
Name	Description  
id \*  
integer  
(path)  
Authority ID

id  
with  
string  
(query)  
Relations (e.g. category)

with  
Responses  
Response content type

application/json  
Code	Description  
200	  
OK

Example Value  
Model  
{  
  "active": true,  
  "category": {  
    "active": true,  
    "code": "string",  
    "created\_at": "string",  
    "id": 0,  
    "order": 0,  
    "title": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "updated\_at": "string"  
  },  
  "category\_id": 0,  
  "code": "string",  
  "created\_at": "string",  
  "icon\_url": "string",  
  "id": 0,  
  "order": 0,  
  "tin": 0,  
  "title": {  
    "en": "string",  
    "kaa": "string",  
    "ru": "string",  
    "uz": "string"  
  },  
  "updated\_at": "string"  
}

GET  
/integration/v2/dictionaries  
List dictionary definitions (integration JWT)

Same behavior as GET /v2/dictionaries. Integration middleware provides cabinet user context.

Parameters  
Try it out  
Name	Description  
page  
integer  
(query)  
Page number

page  
limit  
integer  
(query)  
Items per page

limit  
Responses  
Response content type

application/json  
Code	Description  
200	  
OK

Example Value  
Model  
\[  
  {  
    "code": "string",  
    "columns": \[  
      {  
        "default": "string",  
        "length": 0,  
        "max": 0,  
        "min": 0,  
        "name": "string",  
        "required": true,  
        "type": "string"  
      }  
    \],  
    "created\_at": "string",  
    "creator\_id": "string",  
    "id": 0,  
    "parent\_id\_type": "int",  
    "status": "string",  
    "title": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "updated\_at": "string"  
  }  
\]

GET  
/integration/v2/dictionaries/universal  
List rows in a generated dictionary table (integration JWT)

Requires query dictionary\_code. Same as GET /v2/dictionaries/universal.

Parameters  
Try it out  
Name	Description  
dictionary\_code \*  
string  
(query)  
Dictionary code (kebab-case)

dictionary\_code  
page  
integer  
(query)  
Page number

page  
limit  
integer  
(query)  
Items per page

limit  
isLike  
boolean  
(query)  
Enable ILIKE filters

\--  
Responses  
Response content type

application/json  
Code	Description  
200	  
OK

Example Value  
Model  
\[  
  {}  
\]

GET  
/integration/v2/dictionaries/universal/all  
List all rows in a generated dictionary table without pagination (integration JWT)

Parameters  
Try it out  
Name	Description  
dictionary\_code \*  
string  
(query)  
Dictionary code

dictionary\_code  
isLike  
boolean  
(query)  
Enable ILIKE filters

\--  
Responses  
Response content type

application/json  
Code	Description  
200	  
OK

Example Value  
Model  
\[  
  {}  
\]

GET  
/integration/v2/dictionaries/universal/{id}  
Get one row in a generated dictionary table (integration JWT)

Parameters  
Try it out  
Name	Description  
id \*  
integer  
(path)  
Row ID

id  
dictionary\_code \*  
string  
(query)  
Dictionary code

dictionary\_code  
Responses  
Response content type

application/json  
Code	Description  
200	  
OK

Example Value  
Model  
{}

GET  
/integration/v2/dictionaries/{id}  
Get dictionary definition by ID (integration JWT)

Parameters  
Try it out  
Name	Description  
id \*  
integer  
(path)  
Dictionary ID

id  
Responses  
Response content type

application/json  
Code	Description  
200	  
OK

Example Value  
Model  
{  
  "code": "string",  
  "columns": \[  
    {  
      "default": "string",  
      "length": 0,  
      "max": 0,  
      "min": 0,  
      "name": "string",  
      "required": true,  
      "type": "string"  
    }  
  \],  
  "created\_at": "string",  
  "creator\_id": "string",  
  "id": 0,  
  "parent\_id\_type": "int",  
  "status": "string",  
  "title": {  
    "en": "string",  
    "kaa": "string",  
    "ru": "string",  
    "uz": "string"  
  },  
  "updated\_at": "string"  
}

GET  
/integration/v2/reports  
List reports (integration JWT)

Parameters  
Try it out  
No parameters

Responses  
Response content type

application/json  
Code	Description  
200	  
OK

Example Value  
Model  
\[  
  {  
    "activated\_at": "string",  
    "actual\_version\_id": 0,  
    "authority": {  
      "active": true,  
      "category": {  
        "active": true,  
        "code": "string",  
        "created\_at": "string",  
        "id": 0,  
        "order": 0,  
        "title": {  
          "en": "string",  
          "kaa": "string",  
          "ru": "string",  
          "uz": "string"  
        },  
        "updated\_at": "string"  
      },  
      "category\_id": 0,  
      "code": "string",  
      "created\_at": "string",  
      "icon\_url": "string",  
      "id": 0,  
      "order": 0,  
      "tin": 0,  
      "title": {  
        "en": "string",  
        "kaa": "string",  
        "ru": "string",  
        "uz": "string"  
      },  
      "updated\_at": "string"  
    },  
    "authority\_id": 0,  
    "code": "string",  
    "contacts": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "created\_at": "string",  
    "deactivated": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "deactivated\_at": "string",  
    "deadline\_lock\_enabled": true,  
    "deadline\_locked\_text": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "deadline\_notice\_text": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "deadline\_windows": \[  
      "string"  
    \],  
    "description": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "detail\_info": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "developing\_versions": \[  
      {  
        "report\_version\_id": 0,  
        "user\_uuids": \[  
          "string"  
        \]  
      }  
    \],  
    "elements\_count": 0,  
    "fill\_time": 0,  
    "id": 0,  
    "is\_favorite": true,  
    "legal\_basis": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "locked": true,  
    "locked\_text": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "main\_sphere": {  
      "active": true,  
      "code": "string",  
      "created\_at": "string",  
      "description": {  
        "en": "string",  
        "kaa": "string",  
        "ru": "string",  
        "uz": "string"  
      },  
      "icon\_url": "string",  
      "id": 0,  
      "order": 0,  
      "title": {  
        "en": "string",  
        "kaa": "string",  
        "ru": "string",  
        "uz": "string"  
      },  
      "updated\_at": "string"  
    },  
    "main\_sphere\_id": 0,  
    "name": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "next\_available\_period": "string",  
    "order": 0,  
    "rate": 0,  
    "report\_deadline": {  
      "active": true,  
      "code": "string",  
      "created\_at": "string",  
      "day": 0,  
      "id": 0,  
      "order": 0,  
      "title": {  
        "en": "string",  
        "kaa": "string",  
        "ru": "string",  
        "uz": "string"  
      },  
      "updated\_at": "string"  
    },  
    "report\_deadline\_id": 0,  
    "report\_periodicity": {  
      "active": true,  
      "code": "string",  
      "created\_at": "string",  
      "id": 0,  
      "month": 0,  
      "order": 0,  
      "title": {  
        "en": "string",  
        "kaa": "string",  
        "ru": "string",  
        "uz": "string"  
      },  
      "updated\_at": "string"  
    },  
    "report\_periodicity\_id": 0,  
    "report\_status": "string",  
    "report\_versions": \[  
      {  
        "activated\_at": "string",  
        "approving\_group\_ids": \[  
          0  
        \],  
        "code": "string",  
        "created\_at": "string",  
        "deactivated\_at": "string",  
        "id": 0,  
        "is\_actual": true,  
        "is\_blocked\_to\_reapply": true,  
        "report\_id": 0,  
        "submit\_task\_api\_type": "string",  
        "title": {  
          "en": "string",  
          "kaa": "string",  
          "ru": "string",  
          "uz": "string"  
        },  
        "updated\_at": "string"  
      }  
    \],  
    "short\_title": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "sphere": {  
      "active": true,  
      "code": "string",  
      "created\_at": "string",  
      "description": {  
        "en": "string",  
        "kaa": "string",  
        "ru": "string",  
        "uz": "string"  
      },  
      "icon\_url": "string",  
      "id": 0,  
      "order": 0,  
      "title": {  
        "en": "string",  
        "kaa": "string",  
        "ru": "string",  
        "uz": "string"  
      },  
      "updated\_at": "string"  
    },  
    "sphere\_id": 0,  
    "title": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "updated\_at": "string",  
    "user\_types": \[  
      "string"  
    \],  
    "video\_link": "string"  
  }  
\]

GET  
/integration/v2/reports/all  
List all reports for authority (integration JWT)

Parameters  
Try it out  
No parameters

Responses  
Response content type

application/json  
Code	Description  
200	  
OK

Example Value  
Model  
\[  
  {  
    "activated\_at": "string",  
    "actual\_version\_id": 0,  
    "authority": {  
      "active": true,  
      "category": {  
        "active": true,  
        "code": "string",  
        "created\_at": "string",  
        "id": 0,  
        "order": 0,  
        "title": {  
          "en": "string",  
          "kaa": "string",  
          "ru": "string",  
          "uz": "string"  
        },  
        "updated\_at": "string"  
      },  
      "category\_id": 0,  
      "code": "string",  
      "created\_at": "string",  
      "icon\_url": "string",  
      "id": 0,  
      "order": 0,  
      "tin": 0,  
      "title": {  
        "en": "string",  
        "kaa": "string",  
        "ru": "string",  
        "uz": "string"  
      },  
      "updated\_at": "string"  
    },  
    "authority\_id": 0,  
    "code": "string",  
    "contacts": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "created\_at": "string",  
    "deactivated": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "deactivated\_at": "string",  
    "deadline\_lock\_enabled": true,  
    "deadline\_locked\_text": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "deadline\_notice\_text": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "deadline\_windows": \[  
      "string"  
    \],  
    "description": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "detail\_info": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "developing\_versions": \[  
      {  
        "report\_version\_id": 0,  
        "user\_uuids": \[  
          "string"  
        \]  
      }  
    \],  
    "elements\_count": 0,  
    "fill\_time": 0,  
    "id": 0,  
    "is\_favorite": true,  
    "legal\_basis": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "locked": true,  
    "locked\_text": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "main\_sphere": {  
      "active": true,  
      "code": "string",  
      "created\_at": "string",  
      "description": {  
        "en": "string",  
        "kaa": "string",  
        "ru": "string",  
        "uz": "string"  
      },  
      "icon\_url": "string",  
      "id": 0,  
      "order": 0,  
      "title": {  
        "en": "string",  
        "kaa": "string",  
        "ru": "string",  
        "uz": "string"  
      },  
      "updated\_at": "string"  
    },  
    "main\_sphere\_id": 0,  
    "name": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "next\_available\_period": "string",  
    "order": 0,  
    "rate": 0,  
    "report\_deadline": {  
      "active": true,  
      "code": "string",  
      "created\_at": "string",  
      "day": 0,  
      "id": 0,  
      "order": 0,  
      "title": {  
        "en": "string",  
        "kaa": "string",  
        "ru": "string",  
        "uz": "string"  
      },  
      "updated\_at": "string"  
    },  
    "report\_deadline\_id": 0,  
    "report\_periodicity": {  
      "active": true,  
      "code": "string",  
      "created\_at": "string",  
      "id": 0,  
      "month": 0,  
      "order": 0,  
      "title": {  
        "en": "string",  
        "kaa": "string",  
        "ru": "string",  
        "uz": "string"  
      },  
      "updated\_at": "string"  
    },  
    "report\_periodicity\_id": 0,  
    "report\_status": "string",  
    "report\_versions": \[  
      {  
        "activated\_at": "string",  
        "approving\_group\_ids": \[  
          0  
        \],  
        "code": "string",  
        "created\_at": "string",  
        "deactivated\_at": "string",  
        "id": 0,  
        "is\_actual": true,  
        "is\_blocked\_to\_reapply": true,  
        "report\_id": 0,  
        "submit\_task\_api\_type": "string",  
        "title": {  
          "en": "string",  
          "kaa": "string",  
          "ru": "string",  
          "uz": "string"  
        },  
        "updated\_at": "string"  
      }  
    \],  
    "short\_title": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "sphere": {  
      "active": true,  
      "code": "string",  
      "created\_at": "string",  
      "description": {  
        "en": "string",  
        "kaa": "string",  
        "ru": "string",  
        "uz": "string"  
      },  
      "icon\_url": "string",  
      "id": 0,  
      "order": 0,  
      "title": {  
        "en": "string",  
        "kaa": "string",  
        "ru": "string",  
        "uz": "string"  
      },  
      "updated\_at": "string"  
    },  
    "sphere\_id": 0,  
    "title": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "updated\_at": "string",  
    "user\_types": \[  
      "string"  
    \],  
    "video\_link": "string"  
  }  
\]

GET  
/integration/v2/reports/{id}/deadline-status  
Check report deadline lock status (integration JWT)

Parameters  
Try it out  
Name	Description  
id \*  
integer  
(path)  
Report ID

id  
Responses  
Response content type

application/json  
Code	Description  
200	  
OK

Example Value  
Model  
{  
  "lock\_enabled": true,  
  "locked": true,  
  "locked\_text": {  
    "en": "string",  
    "kaa": "string",  
    "ru": "string",  
    "uz": "string"  
  },  
  "next\_available\_period": "string",  
  "windows": \[  
    "string"  
  \]  
}

GET  
/integration/v2/reports/{id}/get-draft-task  
Get or create draft task (integration source)

Parameters  
Try it out  
Name	Description  
id \*  
integer  
(path)  
Report ID

id  
Responses  
Response content type

application/json  
Code	Description  
200	  
OK

Example Value  
Model  
{  
  "authority\_code": "string",  
  "authority\_id": 0,  
  "created\_at": "string",  
  "current\_node\_code": "string",  
  "current\_node\_id": 0,  
  "id": 0,  
  "is\_blocked\_to\_reapply": true,  
  "last\_updated\_at": "string",  
  "owner\_pin": "string",  
  "owner\_tin": "string",  
  "previous\_node\_code": "string",  
  "previous\_node\_id": 0,  
  "report\_code": "string",  
  "report\_id": 0,  
  "report\_version\_code": "string",  
  "report\_version\_id": 0,  
  "short\_title": {  
    "en": "string",  
    "kaa": "string",  
    "ru": "string",  
    "uz": "string"  
  },  
  "source": "string",  
  "status": "string",  
  "submitted\_at": "string",  
  "title": {  
    "en": "string",  
    "kaa": "string",  
    "ru": "string",  
    "uz": "string"  
  },  
  "updated\_at": "string",  
  "user\_type": "string",  
  "user\_uuid": "string"  
}

GET  
/integration/v2/spheres  
List spheres (integration JWT)

Same as GET /v2/spheres (filter e.g. filter\[active\]=true per API conventions).

Parameters  
Try it out  
No parameters

Responses  
Response content type

application/json  
Code	Description  
200	  
OK

Example Value  
Model  
\[  
  {  
    "active": true,  
    "code": "string",  
    "created\_at": "string",  
    "description": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "icon\_url": "string",  
    "id": 0,  
    "order": 0,  
    "title": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "updated\_at": "string"  
  }  
\]

GET  
/integration/v2/spheres/{id}  
Get sphere by ID (integration JWT)

Parameters  
Try it out  
Name	Description  
id \*  
integer  
(path)  
Sphere ID

id  
Responses  
Response content type

application/json  
Code	Description  
200	  
OK

Example Value  
Model  
{  
  "active": true,  
  "code": "string",  
  "created\_at": "string",  
  "description": {  
    "en": "string",  
    "kaa": "string",  
    "ru": "string",  
    "uz": "string"  
  },  
  "icon\_url": "string",  
  "id": 0,  
  "order": 0,  
  "title": {  
    "en": "string",  
    "kaa": "string",  
    "ru": "string",  
    "uz": "string"  
  },  
  "updated\_at": "string"  
}

GET  
/integration/v2/tasks  
List tasks (integration JWT)

Non-draft tasks for the current integration context. Authority credentials use authority-scoped listing; basic/juridical use the same rules as /v2/tasks.

Parameters  
Try it out  
No parameters

Responses  
Response content type

application/json  
Code	Description  
200	  
OK

Example Value  
Model  
\[  
  {  
    "authority\_code": "string",  
    "authority\_id": 0,  
    "created\_at": "string",  
    "current\_node\_code": "string",  
    "current\_node\_id": 0,  
    "id": 0,  
    "last\_updated\_at": "string",  
    "owner\_pin": "string",  
    "owner\_tin": "string",  
    "previous\_node\_code": "string",  
    "previous\_node\_id": 0,  
    "report\_code": "string",  
    "report\_id": 0,  
    "report\_version\_code": "string",  
    "report\_version\_id": 0,  
    "short\_title": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "source": "string",  
    "status": "string",  
    "submitted\_at": "string",  
    "title": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "updated\_at": "string",  
    "user\_type": "string",  
    "user\_uuid": "string"  
  }  
\]

GET  
/integration/v2/tasks/drafts  
List draft tasks (integration JWT)

Returns paginated draft tasks for the current integration credential. Pass search to filter by report title or short\_title (case-insensitive ILIKE on all language variants).

Parameters  
Try it out  
Name	Description  
search  
string  
(query)  
Search by report title or short\_title

search  
limit  
integer  
(query)  
Max items (default 10\)

limit  
offset  
integer  
(query)  
Offset (default 0\)

offset  
sort  
string  
(query)  
Sort field and direction, e.g. created\_at:desc

sort  
Responses  
Response content type

application/json  
Code	Description  
200	  
OK

Example Value  
Model  
\[  
  {  
    "authority\_code": "string",  
    "authority\_id": 0,  
    "created\_at": "string",  
    "current\_node\_code": "string",  
    "current\_node\_id": 0,  
    "id": 0,  
    "last\_updated\_at": "string",  
    "owner\_pin": "string",  
    "owner\_tin": "string",  
    "previous\_node\_code": "string",  
    "previous\_node\_id": 0,  
    "report\_code": "string",  
    "report\_id": 0,  
    "report\_version\_code": "string",  
    "report\_version\_id": 0,  
    "short\_title": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "source": "string",  
    "status": "string",  
    "submitted\_at": "string",  
    "title": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "updated\_at": "string",  
    "user\_type": "string",  
    "user\_uuid": "string"  
  }  
\]  
Headers:  
Name	Description	Type  
X-Total-Count	  
Total matching records

string  
401	  
Unauthorized

Example Value  
Model  
{  
  "code": 200,  
  "data": "string",  
  "error": "string",  
  "message": "Success",  
  "success": true  
}

DELETE  
/integration/v2/tasks/{id}  
Delete a draft task (integration JWT)

Soft-deletes a task (sets status to deleted). Only draft tasks can be deleted. The integration credential must own the task.

Parameters  
Try it out  
Name	Description  
id \*  
integer  
(path)  
Task ID

id  
Responses  
Response content type

application/json  
Code	Description  
200	  
Task deleted

Example Value  
Model  
{  
  "code": 200,  
  "data": "string",  
  "error": "string",  
  "message": "Success",  
  "success": true  
}  
400	  
Task is not in draft status

Example Value  
Model  
{  
  "code": 200,  
  "data": "string",  
  "error": "string",  
  "message": "Success",  
  "success": true  
}  
403	  
Access denied

Example Value  
Model  
{  
  "code": 200,  
  "data": "string",  
  "error": "string",  
  "message": "Success",  
  "success": true  
}  
404	  
Task not found

Example Value  
Model  
{  
  "code": 200,  
  "data": "string",  
  "error": "string",  
  "message": "Success",  
  "success": true  
}

GET  
/integration/v2/tasks/{id}/all-steps  
All steps in current group (integration JWT)

Parameters  
Try it out  
Name	Description  
id \*  
integer  
(path)  
Task ID

id  
Responses  
Response content type

application/json  
Code	Description  
200	  
OK

Example Value  
Model  
{  
  "nodes": \[  
    {  
      "actions": \[  
        {  
          "body": {  
            "additionalProp1": "string",  
            "additionalProp2": "string",  
            "additionalProp3": "string"  
          },  
          "code": "string",  
          "created\_at": "string",  
          "description": {  
            "en": "string",  
            "kaa": "string",  
            "ru": "string",  
            "uz": "string"  
          },  
          "fields": \[  
            {  
              "action\_id": 0,  
              "code": "string",  
              "colspan": 0,  
              "comment": "string",  
              "coordinate\_x": 0,  
              "coordinate\_y": 0,  
              "created\_at": "string",  
              "default\_value": "string",  
              "description": {  
                "en": "string",  
                "kaa": "string",  
                "ru": "string",  
                "uz": "string"  
              },  
              "field\_comment": "string",  
              "functions": "string",  
              "has\_comment": true,  
              "id": 0,  
              "is\_disabled": true,  
              "is\_hidden": true,  
              "is\_required": true,  
              "label": {  
                "additionalProp1": "string",  
                "additionalProp2": "string",  
                "additionalProp3": "string"  
              },  
              "node\_id": 0,  
              "options": "string",  
              "placeholder": {  
                "en": "string",  
                "kaa": "string",  
                "ru": "string",  
                "uz": "string"  
              },  
              "report\_version\_id": 0,  
              "rowspan": 0,  
              "rules": "string",  
              "style": "string",  
              "taxonomy\_code": "string",  
              "taxonomy\_data": {  
                "additionalProp1": "string",  
                "additionalProp2": "string",  
                "additionalProp3": "string"  
              },  
              "title": {  
                "en": "string",  
                "kaa": "string",  
                "ru": "string",  
                "uz": "string"  
              },  
              "type": "Label",  
              "updated\_at": "string",  
              "value": "string"  
            }  
          \],  
          "id": 0,  
          "next\_node\_id": 0,  
          "node\_id": 0,  
          "order": 0,  
          "repeated\_rows": \[  
            0  
          \],  
          "report\_version\_id": 0,  
          "short\_title": {  
            "en": "string",  
            "kaa": "string",  
            "ru": "string",  
            "uz": "string"  
          },  
          "title": {  
            "en": "string",  
            "kaa": "string",  
            "ru": "string",  
            "uz": "string"  
          },  
          "type": "action",  
          "updated\_at": "string"  
        }  
      \],  
      "approving\_group\_id": 0,  
      "body": {  
        "additionalProp1": "string",  
        "additionalProp2": "string",  
        "additionalProp3": "string"  
      },  
      "code": "string",  
      "coordinate\_x": 0,  
      "coordinate\_y": 0,  
      "created\_at": "string",  
      "description": {  
        "en": "string",  
        "kaa": "string",  
        "ru": "string",  
        "uz": "string"  
      },  
      "group\_number": 0,  
      "id": 0,  
      "javascript\_code": "string",  
      "order": 0,  
      "report\_version\_id": 0,  
      "short\_title": {  
        "en": "string",  
        "kaa": "string",  
        "ru": "string",  
        "uz": "string"  
      },  
      "title": {  
        "en": "string",  
        "kaa": "string",  
        "ru": "string",  
        "uz": "string"  
      },  
      "type": "start\_condition",  
      "updated\_at": "string"  
    }  
  \]  
}

GET  
/integration/v2/tasks/{id}/current-node  
Current node for task (integration JWT)

Parameters  
Try it out  
Name	Description  
id \*  
integer  
(path)  
Task ID

id  
Responses  
Response content type

application/json  
Code	Description  
200	  
OK

Example Value  
Model  
{  
  "nodes": \[  
    {  
      "actions": \[  
        {  
          "body": {  
            "additionalProp1": "string",  
            "additionalProp2": "string",  
            "additionalProp3": "string"  
          },  
          "code": "string",  
          "created\_at": "string",  
          "description": {  
            "en": "string",  
            "kaa": "string",  
            "ru": "string",  
            "uz": "string"  
          },  
          "fields": \[  
            {  
              "action\_id": 0,  
              "code": "string",  
              "colspan": 0,  
              "comment": "string",  
              "coordinate\_x": 0,  
              "coordinate\_y": 0,  
              "created\_at": "string",  
              "default\_value": "string",  
              "description": {  
                "en": "string",  
                "kaa": "string",  
                "ru": "string",  
                "uz": "string"  
              },  
              "field\_comment": "string",  
              "functions": "string",  
              "has\_comment": true,  
              "id": 0,  
              "is\_disabled": true,  
              "is\_hidden": true,  
              "is\_required": true,  
              "label": {  
                "additionalProp1": "string",  
                "additionalProp2": "string",  
                "additionalProp3": "string"  
              },  
              "node\_id": 0,  
              "options": "string",  
              "placeholder": {  
                "en": "string",  
                "kaa": "string",  
                "ru": "string",  
                "uz": "string"  
              },  
              "report\_version\_id": 0,  
              "rowspan": 0,  
              "rules": "string",  
              "style": "string",  
              "taxonomy\_code": "string",  
              "taxonomy\_data": {  
                "additionalProp1": "string",  
                "additionalProp2": "string",  
                "additionalProp3": "string"  
              },  
              "title": {  
                "en": "string",  
                "kaa": "string",  
                "ru": "string",  
                "uz": "string"  
              },  
              "type": "Label",  
              "updated\_at": "string",  
              "value": "string"  
            }  
          \],  
          "id": 0,  
          "next\_node\_id": 0,  
          "node\_id": 0,  
          "order": 0,  
          "repeated\_rows": \[  
            0  
          \],  
          "report\_version\_id": 0,  
          "short\_title": {  
            "en": "string",  
            "kaa": "string",  
            "ru": "string",  
            "uz": "string"  
          },  
          "title": {  
            "en": "string",  
            "kaa": "string",  
            "ru": "string",  
            "uz": "string"  
          },  
          "type": "action",  
          "updated\_at": "string"  
        }  
      \],  
      "approving\_group\_id": 0,  
      "body": {  
        "additionalProp1": "string",  
        "additionalProp2": "string",  
        "additionalProp3": "string"  
      },  
      "code": "string",  
      "coordinate\_x": 0,  
      "coordinate\_y": 0,  
      "created\_at": "string",  
      "description": {  
        "en": "string",  
        "kaa": "string",  
        "ru": "string",  
        "uz": "string"  
      },  
      "group\_number": 0,  
      "id": 0,  
      "javascript\_code": "string",  
      "order": 0,  
      "report\_version\_id": 0,  
      "short\_title": {  
        "en": "string",  
        "kaa": "string",  
        "ru": "string",  
        "uz": "string"  
      },  
      "title": {  
        "en": "string",  
        "kaa": "string",  
        "ru": "string",  
        "uz": "string"  
      },  
      "type": "start\_condition",  
      "updated\_at": "string"  
    }  
  \]  
}

GET  
/integration/v2/tasks/{id}/flow-structured  
Task flow structured (integration JWT)

Parameters  
Try it out  
Name	Description  
id \*  
integer  
(path)  
Task ID

id  
Responses  
Response content type

application/json  
Code	Description  
200	  
OK

Example Value  
Model  
{  
  "authority": {  
    "active": true,  
    "category": {  
      "active": true,  
      "code": "string",  
      "created\_at": "string",  
      "id": 0,  
      "order": 0,  
      "title": {  
        "en": "string",  
        "kaa": "string",  
        "ru": "string",  
        "uz": "string"  
      },  
      "updated\_at": "string"  
    },  
    "category\_id": 0,  
    "code": "string",  
    "created\_at": "string",  
    "icon\_url": "string",  
    "id": 0,  
    "order": 0,  
    "tin": 0,  
    "title": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "updated\_at": "string"  
  },  
  "authority\_code": "string",  
  "authority\_id": 0,  
  "created\_at": "string",  
  "current\_node": {  
    "actions": \[  
      {  
        "body": {  
          "additionalProp1": "string",  
          "additionalProp2": "string",  
          "additionalProp3": "string"  
        },  
        "code": "string",  
        "created\_at": "string",  
        "description": {  
          "en": "string",  
          "kaa": "string",  
          "ru": "string",  
          "uz": "string"  
        },  
        "fields": \[  
          {  
            "action\_id": 0,  
            "code": "string",  
            "colspan": 0,  
            "comment": "string",  
            "coordinate\_x": 0,  
            "coordinate\_y": 0,  
            "created\_at": "string",  
            "default\_value": "string",  
            "description": {  
              "en": "string",  
              "kaa": "string",  
              "ru": "string",  
              "uz": "string"  
            },  
            "field\_comment": "string",  
            "functions": "string",  
            "has\_comment": true,  
            "id": 0,  
            "is\_disabled": true,  
            "is\_hidden": true,  
            "is\_required": true,  
            "label": {  
              "additionalProp1": "string",  
              "additionalProp2": "string",  
              "additionalProp3": "string"  
            },  
            "node\_id": 0,  
            "options": "string",  
            "placeholder": {  
              "en": "string",  
              "kaa": "string",  
              "ru": "string",  
              "uz": "string"  
            },  
            "report\_version\_id": 0,  
            "rowspan": 0,  
            "rules": "string",  
            "style": "string",  
            "taxonomy\_code": "string",  
            "taxonomy\_data": {  
              "additionalProp1": "string",  
              "additionalProp2": "string",  
              "additionalProp3": "string"  
            },  
            "title": {  
              "en": "string",  
              "kaa": "string",  
              "ru": "string",  
              "uz": "string"  
            },  
            "type": "Label",  
            "updated\_at": "string",  
            "value": "string"  
          }  
        \],  
        "id": 0,  
        "next\_node\_id": 0,  
        "node\_id": 0,  
        "order": 0,  
        "repeated\_rows": \[  
          0  
        \],  
        "report\_version\_id": 0,  
        "short\_title": {  
          "en": "string",  
          "kaa": "string",  
          "ru": "string",  
          "uz": "string"  
        },  
        "title": {  
          "en": "string",  
          "kaa": "string",  
          "ru": "string",  
          "uz": "string"  
        },  
        "type": "action",  
        "updated\_at": "string"  
      }  
    \],  
    "approving\_group": {  
      "active": true,  
      "authority": {  
        "active": true,  
        "category": {  
          "active": true,  
          "code": "string",  
          "created\_at": "string",  
          "id": 0,  
          "order": 0,  
          "title": {  
            "en": "string",  
            "kaa": "string",  
            "ru": "string",  
            "uz": "string"  
          },  
          "updated\_at": "string"  
        },  
        "category\_id": 0,  
        "code": "string",  
        "created\_at": "string",  
        "icon\_url": "string",  
        "id": 0,  
        "order": 0,  
        "tin": 0,  
        "title": {  
          "en": "string",  
          "kaa": "string",  
          "ru": "string",  
          "uz": "string"  
        },  
        "updated\_at": "string"  
      },  
      "authority\_id": 0,  
      "created\_at": "string",  
      "id": 0,  
      "order": 0,  
      "title": {  
        "en": "string",  
        "kaa": "string",  
        "ru": "string",  
        "uz": "string"  
      },  
      "updated\_at": "string"  
    },  
    "approving\_group\_id": 0,  
    "body": {  
      "additionalProp1": "string",  
      "additionalProp2": "string",  
      "additionalProp3": "string"  
    },  
    "code": "string",  
    "coordinate\_x": 0,  
    "coordinate\_y": 0,  
    "created\_at": "string",  
    "description": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "group\_number": 0,  
    "id": 0,  
    "javascript\_code": "string",  
    "order": 0,  
    "report\_version\_id": 0,  
    "short\_title": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "title": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "type": "start\_condition",  
    "updated\_at": "string"  
  },  
  "current\_node\_code": "string",  
  "current\_node\_id": 0,  
  "id": 0,  
  "last\_updated\_at": "string",  
  "logs": \[  
    {  
      "action\_id": 0,  
      "approving\_group": {  
        "active": true,  
        "authority": {  
          "active": true,  
          "category": {  
            "active": true,  
            "code": "string",  
            "created\_at": "string",  
            "id": 0,  
            "order": 0,  
            "title": {  
              "en": "string",  
              "kaa": "string",  
              "ru": "string",  
              "uz": "string"  
            },  
            "updated\_at": "string"  
          },  
          "category\_id": 0,  
          "code": "string",  
          "created\_at": "string",  
          "icon\_url": "string",  
          "id": 0,  
          "order": 0,  
          "tin": 0,  
          "title": {  
            "en": "string",  
            "kaa": "string",  
            "ru": "string",  
            "uz": "string"  
          },  
          "updated\_at": "string"  
        },  
        "authority\_id": 0,  
        "created\_at": "string",  
        "id": 0,  
        "order": 0,  
        "title": {  
          "en": "string",  
          "kaa": "string",  
          "ru": "string",  
          "uz": "string"  
        },  
        "updated\_at": "string"  
      },  
      "approving\_group\_id": 0,  
      "authority\_id": 0,  
      "body": {  
        "additionalProp1": "string",  
        "additionalProp2": "string",  
        "additionalProp3": "string"  
      },  
      "created\_at": "string",  
      "id": 0,  
      "node": {  
        "actions": \[  
          {  
            "body": {  
              "additionalProp1": "string",  
              "additionalProp2": "string",  
              "additionalProp3": "string"  
            },  
            "code": "string",  
            "created\_at": "string",  
            "description": {  
              "en": "string",  
              "kaa": "string",  
              "ru": "string",  
              "uz": "string"  
            },  
            "fields": \[  
              {  
                "action\_id": 0,  
                "code": "string",  
                "colspan": 0,  
                "comment": "string",  
                "coordinate\_x": 0,  
                "coordinate\_y": 0,  
                "created\_at": "string",  
                "default\_value": "string",  
                "description": {  
                  "en": "string",  
                  "kaa": "string",  
                  "ru": "string",  
                  "uz": "string"  
                },  
                "field\_comment": "string",  
                "functions": "string",  
                "has\_comment": true,  
                "id": 0,  
                "is\_disabled": true,  
                "is\_hidden": true,  
                "is\_required": true,  
                "label": {  
                  "additionalProp1": "string",  
                  "additionalProp2": "string",  
                  "additionalProp3": "string"  
                },  
                "node\_id": 0,  
                "options": "string",  
                "placeholder": {  
                  "en": "string",  
                  "kaa": "string",  
                  "ru": "string",  
                  "uz": "string"  
                },  
                "report\_version\_id": 0,  
                "rowspan": 0,  
                "rules": "string",  
                "style": "string",  
                "taxonomy\_code": "string",  
                "taxonomy\_data": {  
                  "additionalProp1": "string",  
                  "additionalProp2": "string",  
                  "additionalProp3": "string"  
                },  
                "title": {  
                  "en": "string",  
                  "kaa": "string",  
                  "ru": "string",  
                  "uz": "string"  
                },  
                "type": "Label",  
                "updated\_at": "string",  
                "value": "string"  
              }  
            \],  
            "id": 0,  
            "next\_node\_id": 0,  
            "node\_id": 0,  
            "order": 0,  
            "repeated\_rows": \[  
              0  
            \],  
            "report\_version\_id": 0,  
            "short\_title": {  
              "en": "string",  
              "kaa": "string",  
              "ru": "string",  
              "uz": "string"  
            },  
            "title": {  
              "en": "string",  
              "kaa": "string",  
              "ru": "string",  
              "uz": "string"  
            },  
            "type": "action",  
            "updated\_at": "string"  
          }  
        \],  
        "approving\_group": {  
          "active": true,  
          "authority": {  
            "active": true,  
            "category": {  
              "active": true,  
              "code": "string",  
              "created\_at": "string",  
              "id": 0,  
              "order": 0,  
              "title": {  
                "en": "string",  
                "kaa": "string",  
                "ru": "string",  
                "uz": "string"  
              },  
              "updated\_at": "string"  
            },  
            "category\_id": 0,  
            "code": "string",  
            "created\_at": "string",  
            "icon\_url": "string",  
            "id": 0,  
            "order": 0,  
            "tin": 0,  
            "title": {  
              "en": "string",  
              "kaa": "string",  
              "ru": "string",  
              "uz": "string"  
            },  
            "updated\_at": "string"  
          },  
          "authority\_id": 0,  
          "created\_at": "string",  
          "id": 0,  
          "order": 0,  
          "title": {  
            "en": "string",  
            "kaa": "string",  
            "ru": "string",  
            "uz": "string"  
          },  
          "updated\_at": "string"  
        },  
        "approving\_group\_id": 0,  
        "body": {  
          "additionalProp1": "string",  
          "additionalProp2": "string",  
          "additionalProp3": "string"  
        },  
        "code": "string",  
        "coordinate\_x": 0,  
        "coordinate\_y": 0,  
        "created\_at": "string",  
        "description": {  
          "en": "string",  
          "kaa": "string",  
          "ru": "string",  
          "uz": "string"  
        },  
        "group\_number": 0,  
        "id": 0,  
        "javascript\_code": "string",  
        "order": 0,  
        "report\_version\_id": 0,  
        "short\_title": {  
          "en": "string",  
          "kaa": "string",  
          "ru": "string",  
          "uz": "string"  
        },  
        "title": {  
          "en": "string",  
          "kaa": "string",  
          "ru": "string",  
          "uz": "string"  
        },  
        "type": "start\_condition",  
        "updated\_at": "string"  
      },  
      "node\_from\_id": 0,  
      "node\_to\_id": 0,  
      "node\_type": "string",  
      "report\_id": 0,  
      "report\_version\_id": 0,  
      "source": "string",  
      "status\_from": "string",  
      "status\_to": "string",  
      "task\_id": 0,  
      "user": {  
        "fullname": "string"  
      },  
      "user\_agent": "string",  
      "user\_ip": "string",  
      "user\_uuid": "string"  
    }  
  \],  
  "owner\_pin": "string",  
  "owner\_tin": "string",  
  "previous\_node\_code": "string",  
  "previous\_node\_id": 0,  
  "report": {  
    "activated\_at": "string",  
    "actual\_version\_id": 0,  
    "authority\_id": 0,  
    "code": "string",  
    "contacts": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "created\_at": "string",  
    "deactivated": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "deactivated\_at": "string",  
    "description": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "detail\_info": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "developing\_versions": {},  
    "elements\_count": 0,  
    "fill\_time": 0,  
    "id": 0,  
    "legal\_basis": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "main\_sphere\_id": 0,  
    "name": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "report\_deadline\_id": 0,  
    "report\_periodicity\_id": 0,  
    "report\_status": "string",  
    "short\_title": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "sphere\_id": 0,  
    "title": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    },  
    "updated\_at": "string",  
    "user\_types": \[  
      "string"  
    \],  
    "video\_link": "string"  
  },  
  "report\_code": "string",  
  "report\_id": 0,  
  "report\_version\_code": "string",  
  "report\_version\_id": 0,  
  "short\_title": {  
    "en": "string",  
    "kaa": "string",  
    "ru": "string",  
    "uz": "string"  
  },  
  "source": "string",  
  "status": "string",  
  "submit\_task\_api\_type": "string",  
  "submitted\_at": "string",  
  "title": {  
    "en": "string",  
    "kaa": "string",  
    "ru": "string",  
    "uz": "string"  
  },  
  "updated\_at": "string",  
  "user": {  
    "pin": "string",  
    "profile": "string",  
    "uuid": "string"  
  },  
  "user\_type": "string",  
  "user\_uuid": "string"  
}

POST  
/integration/v2/tasks/{id}/submit-all-steps  
Submit all steps in group (integration JWT)

Parameters  
Try it out  
Name	Description  
id \*  
integer  
(path)  
Task ID

id  
body \*  
object  
(body)  
All nodes field values

Example Value  
Model  
{  
  "nodes": \[  
    {  
      "actions": \[  
        {  
          "fields": \[  
            {  
              "comment": "string",  
              "id": 0,  
              "value": "string"  
            }  
          \],  
          "id": 0  
        }  
      \],  
      "id": 0  
    }  
  \]  
}  
Parameter content type

application/json  
Responses  
Response content type

application/json  
Code	Description  
200	  
OK

Example Value  
Model  
{  
  "next\_node\_id": 0,  
  "status": "string",  
  "task\_id": 0,  
  "task\_log\_ids": \[  
    0  
  \]  
}

POST  
/integration/v2/tasks/{id}/submit-current-node  
Submit current node (integration JWT)

Parameters  
Try it out  
Name	Description  
id \*  
integer  
(path)  
Task ID

id  
body \*  
object  
(body)  
Submission payload

Example Value  
Model  
{  
  "action\_id": 0,  
  "actions": \[  
    {  
      "fields": \[  
        {  
          "comment": "string",  
          "id": 0,  
          "value": "string"  
        }  
      \],  
      "id": 0  
    }  
  \]  
}  
Parameter content type

application/json  
Responses  
Response content type

application/json  
Code	Description  
200	  
OK

Example Value  
Model  
{  
  "next\_node\_id": 0,  
  "status": "string",  
  "task\_id": 0,  
  "task\_log\_id": 0  
}  
integration-users

GET  
/integration/v2/users/me  
Current integration identity

Returns the authenticated integration context: owning user (PIN, profile), credential scope (username, user\_type, expires\_at), and the juridical or authority context when the credential is scoped to one.

Parameters  
Try it out  
No parameters

Responses  
Response content type

application/json  
Code	Description  
200	  
OK

Example Value  
Model  
{  
  "authority": {  
    "code": "string",  
    "id": 0,  
    "title": {  
      "en": "string",  
      "kaa": "string",  
      "ru": "string",  
      "uz": "string"  
    }  
  },  
  "credential": {  
    "expires\_at": "string",  
    "id": "string",  
    "status": "string",  
    "user\_type": "string",  
    "username": "string"  
  },  
  "juridical": {  
    "name": "string",  
    "tin": 0,  
    "uuid": "string"  
  },  
  "user": {  
    "pin": "string",  
    "profile": {  
      "activity\_info": {  
        "capital": "string",  
        "numbers": 0,  
        "qqs\_number": "string",  
        "rating": "string",  
        "tax\_type": "string"  
      },  
      "bank\_info": {  
        "code": 0,  
        "name": "string",  
        "number": "string",  
        "okonx": 0  
      },  
      "birth\_country": "string",  
      "birth\_country\_id": 0,  
      "birth\_date": "string",  
      "birth\_place": "string",  
      "citizenship": "string",  
      "citizenship\_id": 0,  
      "contact\_info": {  
        "address": "string",  
        "email": "string",  
        "phone": "string",  
        "soato\_code": 0  
      },  
      "firstname": "string",  
      "fullname": "string",  
      "live\_status": 0,  
      "middlename": "string",  
      "nationality": "string",  
      "nationality\_id": 0,  
      "passport": "string",  
      "pin": "string",  
      "sex": "string",  
      "surname": "string",  
      "valid": "string"  
    },  
    "status": "string",  
    "uuid": "string"  
  }  
}  
401	  
Unauthorized

Example Value  
Model  
{  
  "additionalProp1": {}  
}  
Health

GET  
/ip  
Get client IP address

Returns the IP address of the client making the request

Parameters  
Try it out  
No parameters

Responses  
Response content type

application/json  
Code	Description  
200	  
OK

Example Value  
Model  
{  
  "code": 200,  
  "data": "string",  
  "error": "string",  
  "message": "Success",  
  "success": true  
}

GET  
/ping  
Health check

Ping endpoint

Parameters  
Try it out  
No parameters

Responses  
Response content type

application/json  
Code	Description  
200	  
OK

Example Value  
Model  
{  
  "code": 200,  
  "data": "string",  
  "error": "string",  
  "message": "Success",  
  "success": true  
}

Models  
action.Body{  
}  
action.Typestring  
Enum:  
\[ action, form, table, repeatable\_table \]  
actionField.FieldTypestring  
Enum:  
\[ Label, LabelHeader, LabelHtml, InputString, InputStringLabel, InputInteger, InputIntegerLabel, InputFloat, InputFloatLabel, FileUpload, MultipleFileUpload, Select, SelectLabel, DatePicker, DatePickerLabel, InputSearch, InputSearchLabel, TextArea, TextAreaLabel, Checkbox, CheckboxLabel, VerifyWithEds \]  
actionField.JSONB{  
}  
apiIntegration.LoginRequest  
apiIntegration.LoginResource  
apiIntegration.MeAuthorityResource  
apiIntegration.MeCredentialResource  
apiIntegration.MeJuridicalResource  
apiIntegration.MeResource  
apiIntegration.MeUserResource  
apiIntegration.RefreshRequest  
authorities.Resource  
authority.Category  
authority.Model  
authorityCategories.Resource  
dictionaries.ColumnDefinition  
dictionaries.ColumnType  
dictionaries.ParentIDType  
dictionaries.Resource  
entities.MultiLang  
node.Body  
node.Type  
reportDeadlineLock.StatusResource  
reportDeadlines.Resource  
reportPeriodicity.Resource  
reportVersion.Resource  
reports.DevelopingVersion  
reports.DraftTaskResource  
reports.Resource  
response.Response  
spheres.Resource  
task.ActionWithFields  
task.AllStepsResource  
task.CurrentNodeFieldWithValueResource  
task.CurrentNodeItemResource  
task.CurrentNodeResource  
task.FlowApprovingGroupResource  
task.FlowLogUserResource  
task.FlowReportResource  
task.FlowUserResource  
task.FlowV2ActionResource  
task.FlowV2FieldWithValueResource  
task.FlowV2LogResource  
task.FlowV2NodeResource  
task.FlowV2Resource  
task.RawJSON  
task.Resource  
task.SubmitAllStepsNodeRequest  
task.SubmitAllStepsRequest  
task.SubmitAllStepsResource  
task.SubmitCurrentNodeActionRequest  
task.SubmitCurrentNodeFieldRequest  
task.SubmitCurrentNodeRequest  
task.SubmitCurrentNodeResource  
user.Profile  
user.ProfileActivityInfo  
user.ProfileBankInfo  
user.ProfileContactInfo  
Online validator badge  