library;

use ::data_structures::campaign_info::CampaignInfo;

pub struct CancelledCampaignEvent {
    pub campaign_id: u64,
}

pub struct SuccessfulCampaignEvent {
    pub campaign_id: u64,
    pub total_signs: u64,
}

pub struct CreatedCampaignEvent {
    pub author: Identity,
    pub campaign_info: CampaignInfo,
    pub campaign_id: u64,
}

pub struct SignedEvent {
    pub campaign_id: u64,
    pub user: Identity,
}

pub struct UnsignedEvent {
    pub campaign_id: u64,
    pub user: Identity,
}
