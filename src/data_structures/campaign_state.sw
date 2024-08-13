library;

use core::ops::Eq;

pub enum CampaignState {
    pub Cancelled: (),
    pub Successful: (),
    pub Progress: (),
}

impl Eq for CampaignState {
    fn eq(self, other: CampaignState) -> bool {
        match (self, other) {
            (CampaignState::Cancelled, CampaignState::Cancelled) => true,
            (CampaignState::Successful, CampaignState::Successful) => true,
            (CampaignState::Progress, CampaignState::Progress) => true,
            _ => false,
        }
    }
}
