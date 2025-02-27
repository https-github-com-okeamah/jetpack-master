import { BaseControl } from '@wordpress/components';
import ConsentBlockSettings from './jetpack-newsletter-integration-settings-consent-block';
import CreativeMailPlugin from './jetpack-newsletter-integration-settings-creativemail';

const NewsletterIntegrationSettings = () => {
	return (
		<BaseControl __nextHasNoMarginBottom={ true }>
			<ConsentBlockSettings />
			<CreativeMailPlugin />
		</BaseControl>
	);
};

export default NewsletterIntegrationSettings;
