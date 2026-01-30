from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from ..database import get_database
from ..models.feature import FeatureResponse, EvaluateRequest, EvaluateResponse
from ..services.feature_service import FeatureService

router = APIRouter(prefix="/api/sdk", tags=["sdk"])


def get_feature_service(db: AsyncIOMotorDatabase = Depends(get_database)) -> FeatureService:
    return FeatureService(db)


@router.get("/features", response_model=list[FeatureResponse])
async def get_active_features(
    app_id: str,
    service: FeatureService = Depends(get_feature_service)
):
    """Get all active features for an app (enabled and within date range)."""
    return await service.get_active_features(app_id)


@router.get("/features/{key}")
async def get_feature_by_key(
    key: str,
    app_id: str,
    service: FeatureService = Depends(get_feature_service)
):
    """Check if a specific feature is enabled by key."""
    feature = await service.get_feature_by_key(key)
    if not feature or feature.app_id != app_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Feature '{key}' not found for app '{app_id}'"
        )
    return {
        "key": feature.key,
        "enabled": feature.enabled,
        "rollout_percentage": feature.rollout_percentage
    }


@router.post("/evaluate", response_model=EvaluateResponse)
async def evaluate_features(
    request: EvaluateRequest,
    service: FeatureService = Depends(get_feature_service)
):
    """
    Evaluate features for a specific user.
    Handles percentage rollout using consistent hashing.
    """
    features = await service.evaluate_features(
        app_id=request.app_id,
        user_id=request.user_id,
        feature_keys=request.feature_keys
    )
    return EvaluateResponse(features=features)
