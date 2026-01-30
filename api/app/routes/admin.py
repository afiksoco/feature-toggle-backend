from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from ..database import get_database
from ..models.feature import FeatureCreate, FeatureUpdate, FeatureResponse
from ..services.feature_service import FeatureService

router = APIRouter(prefix="/api/admin/features", tags=["admin"])


def get_feature_service(db: AsyncIOMotorDatabase = Depends(get_database)) -> FeatureService:
    return FeatureService(db)


@router.post("", response_model=FeatureResponse, status_code=status.HTTP_201_CREATED)
async def create_feature(
    feature: FeatureCreate,
    service: FeatureService = Depends(get_feature_service)
):
    """Create a new feature toggle."""
    existing = await service.get_feature_by_key(feature.key, feature.app_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Feature with key '{feature.key}' already exists for app '{feature.app_id}'"
        )
    return await service.create_feature(feature)


@router.get("", response_model=list[FeatureResponse])
async def list_features(
    app_id: str | None = None,
    service: FeatureService = Depends(get_feature_service)
):
    """List all features, optionally filtered by app_id."""
    return await service.get_all_features(app_id)


@router.get("/{feature_id}", response_model=FeatureResponse)
async def get_feature(
    feature_id: str,
    service: FeatureService = Depends(get_feature_service)
):
    """Get a feature by ID."""
    feature = await service.get_feature_by_id(feature_id)
    if not feature:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature not found"
        )
    return feature


@router.put("/{feature_id}", response_model=FeatureResponse)
async def update_feature(
    feature_id: str,
    update: FeatureUpdate,
    service: FeatureService = Depends(get_feature_service)
):
    """Update a feature."""
    # Check if updating key to an existing one
    if update.key:
        existing = await service.get_feature_by_key(update.key)
        if existing and existing.id != feature_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Feature with key '{update.key}' already exists"
            )

    feature = await service.update_feature(feature_id, update)
    if not feature:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature not found"
        )
    return feature


@router.delete("/{feature_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_feature(
    feature_id: str,
    service: FeatureService = Depends(get_feature_service)
):
    """Delete a feature."""
    deleted = await service.delete_feature(feature_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature not found"
        )
