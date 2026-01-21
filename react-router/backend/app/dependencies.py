from typing import Annotated
from fastapi import Depends
from sqlmodel import Session
from .db import get_session

#I just implemented this dependency in this file since is the more used. 
# Other dependendencies are in the different routes
# However, is a better practice to keep the more used dependencies here
SessionDep = Annotated[Session, Depends(get_session)]
