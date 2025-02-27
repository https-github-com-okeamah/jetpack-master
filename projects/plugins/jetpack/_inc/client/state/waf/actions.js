import restApi from '@automattic/jetpack-api';
import {
	WAF_SETTINGS_FETCH,
	WAF_SETTINGS_FETCH_RECEIVE,
	WAF_SETTINGS_FETCH_FAIL,
	WAF_SETTINGS_UPDATE,
	WAF_SETTINGS_UPDATE_SUCCESS,
	WAF_SETTINGS_UPDATE_FAIL,
} from 'state/action-types';

export const fetchWafSettings = () => {
	return dispatch => {
		dispatch( {
			type: WAF_SETTINGS_FETCH,
		} );
		return restApi
			.fetchWafSettings()
			.then( settings => {
				dispatch( {
					type: WAF_SETTINGS_FETCH_RECEIVE,
					settings,
				} );
				return settings;
			} )
			.catch( error => {
				dispatch( {
					type: WAF_SETTINGS_FETCH_FAIL,
					error: error,
				} );
			} );
	};
};

/**
 * Update WAF Settings
 *
 * @param {object}  newSettings                    - The new settings to be saved.
 * @param {boolean} newSettings.ipAllowListEnabled - Whether IP allow list is enabled.
 * @param {boolean} newSettings.ipBlockListEnabled - Whether IP block list is enabled.
 * @param {string}  newSettings.ipAllowList        - The IP allow list.
 * @param {string}  newSettings.ipBlockList        - The IP block list.
 * @param {boolean} newSettings.shareData          - Whether to share data.
 * @param {boolean} newSettings.shareDebugData     - Whether to share detailed data.
 * @return {Function} - The action.
 */
export const updateWafSettings = newSettings => {
	return dispatch => {
		dispatch( {
			type: WAF_SETTINGS_UPDATE,
		} );
		return restApi
			.updateWafSettings( {
				jetpack_waf_automatic_rules: newSettings.automaticRulesEnabled,
				jetpack_waf_ip_allow_list_enabled: newSettings.ipAllowListEnabled,
				jetpack_waf_ip_block_list_enabled: newSettings.ipBlockListEnabled,
				jetpack_waf_ip_allow_list: newSettings.ipAllowList,
				jetpack_waf_ip_block_list: newSettings.ipBlockList,
				jetpack_waf_share_data: newSettings.shareData,
				jetpack_waf_share_debug_data: newSettings.shareDebugData,
			} )
			.then( settings => {
				dispatch( {
					type: WAF_SETTINGS_UPDATE_SUCCESS,
					settings,
				} );
				return settings;
			} )
			.catch( error => {
				dispatch( {
					type: WAF_SETTINGS_UPDATE_FAIL,
					error: error,
				} );

				throw error;
			} );
	};
};
