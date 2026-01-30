from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class FeatureBase(BaseModel):
    app_id: str = Field(..., description="Application identifier (e.g., 'com.example.app1')")
    key: str = Field(..., description="Unique identifier (e.g., 'dark_mode')")
    name: str = Field(..., description="Display name")
    description: str = Field(default="", description="Feature description")
    enabled: bool = Field(default=False, description="Master on/off switch")
    start_date: Optional[datetime] = Field(default=None, description="When feature becomes active")
    end_date: Optional[datetime] = Field(default=None, description="When feature expires")
    rollout_percentage: int = Field(default=100, ge=0, le=100, description="0-100 for gradual rollout")


class FeatureCreate(FeatureBase):
    pass


class FeatureUpdate(BaseModel):
    key: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    enabled: Optional[bool] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    rollout_percentage: Optional[int] = Field(default=None, ge=0, le=100)


class Feature(FeatureBase):
    id: str = Field(..., alias="_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True


class FeatureResponse(FeatureBase):
    id: str
    created_at: datetime
    updated_at: datetime


class EvaluateRequest(BaseModel):
    app_id: str = Field(..., description="Application identifier")
    user_id: str = Field(..., description="User identifier for rollout evaluation")
    feature_keys: Optional[list[str]] = Field(default=None, description="Specific features to evaluate (all if None)")


class EvaluateResponse(BaseModel):
    features: dict[str, bool] = Field(..., description="Map of feature key to enabled status")
