import { createBlock } from '@wordpress/blocks';
import { Path } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import { __, _x } from '@wordpress/i18n';
import { filter, isEmpty, map, startsWith, trim } from 'lodash';
import JetpackField from './components/jetpack-field';
import JetpackFieldCheckbox from './components/jetpack-field-checkbox';
import JetpackFieldConsent from './components/jetpack-field-consent';
import JetpackDatePicker from './components/jetpack-field-datepicker';
import JetpackDropdown from './components/jetpack-field-dropdown';
import JetpackFieldMultipleChoice from './components/jetpack-field-multiple-choice';
import JetpackFieldMultipleChoiceItem from './components/jetpack-field-multiple-choice/item';
import JetpackFieldSingleChoice from './components/jetpack-field-single-choice';
import JetpackFieldSingleChoiceItem from './components/jetpack-field-single-choice/item';
import JetpackFieldTextarea from './components/jetpack-field-textarea';
import { getIconColor } from './util/block-icons';
import { useFormWrapper } from './util/form';
import getFieldLabel from './util/get-field-label';
import mergeSettings from './util/merge-settings';
import renderMaterialIcon from './util/render-material-icon';

const FieldDefaults = {
	apiVersion: 3,
	category: 'contact-form',
	supports: {
		reusable: false,
		html: false,
	},
	attributes: {
		label: {
			type: 'string',
			default: null,
		},
		required: {
			type: 'boolean',
			default: false,
		},
		requiredText: {
			type: 'string',
		},
		options: {
			type: 'array',
			default: [],
		},
		defaultValue: {
			type: 'string',
			default: '',
		},
		placeholder: {
			type: 'string',
			default: '',
		},
		id: {
			type: 'string',
			default: '',
		},
		width: {
			type: 'number',
			default: 100,
		},
		borderRadius: {
			type: 'number',
			default: '',
		},
		borderWidth: {
			type: 'number',
			default: '',
		},
		labelFontSize: {
			type: 'string',
		},
		fieldFontSize: {
			type: 'string',
		},
		lineHeight: {
			type: 'number',
		},
		labelLineHeight: {
			type: 'number',
		},
		inputColor: {
			type: 'string',
		},
		labelColor: {
			type: 'string',
		},
		fieldBackgroundColor: {
			type: 'string',
		},
		buttonBackgroundColor: {
			type: 'string',
		},
		buttonBorderRadius: {
			type: 'number',
			default: '',
		},
		buttonBorderWidth: {
			type: 'number',
			default: '',
		},
		borderColor: {
			type: 'string',
		},
		shareFieldAttributes: {
			type: 'boolean',
			default: true,
		},
	},
	transforms: {
		to: [
			{
				type: 'block',
				blocks: [ 'jetpack/field-text' ],
				transform: attributes => createBlock( 'jetpack/field-text', attributes ),
			},
			{
				type: 'block',
				blocks: [ 'jetpack/field-name' ],
				transform: attributes => createBlock( 'jetpack/field-name', attributes ),
			},
			{
				type: 'block',
				blocks: [ 'jetpack/field-email' ],
				transform: attributes => createBlock( 'jetpack/field-email', attributes ),
			},
			{
				type: 'block',
				blocks: [ 'jetpack/field-url' ],
				transform: attributes => createBlock( 'jetpack/field-url', attributes ),
			},
			{
				type: 'block',
				blocks: [ 'jetpack/field-date' ],
				transform: attributes => createBlock( 'jetpack/field-date', attributes ),
			},
			{
				type: 'block',
				blocks: [ 'jetpack/field-telephone' ],
				transform: attributes => createBlock( 'jetpack/field-telephone', attributes ),
			},
			{
				type: 'block',
				blocks: [ 'jetpack/field-textarea' ],
				transform: attributes => createBlock( 'jetpack/field-textarea', attributes ),
			},
			{
				type: 'block',
				blocks: [ 'jetpack/field-checkbox-multiple' ],
				transform: ( attributes, innerBlocks ) => {
					let newInnerBlocks = [];

					if ( ! isEmpty( innerBlocks ) ) {
						const optionBlocks = filter( innerBlocks, ( { name } ) =>
							startsWith( name, 'jetpack/field-option' )
						);

						newInnerBlocks = map( optionBlocks, block =>
							createBlock( 'jetpack/field-option-checkbox', {
								label: block.attributes.label,
								fieldType: 'checkbox',
							} )
						);
					} else if ( attributes.options?.length ) {
						newInnerBlocks = map( attributes.options, option =>
							createBlock( 'jetpack/field-option-checkbox', {
								label: option,
								fieldType: 'checkbox',
							} )
						);
					}

					return createBlock( 'jetpack/field-checkbox-multiple', attributes, newInnerBlocks );
				},
			},
			{
				type: 'block',
				blocks: [ 'jetpack/field-radio' ],
				transform: ( attributes, innerBlocks ) => {
					let newInnerBlocks = [];

					if ( ! isEmpty( innerBlocks ) ) {
						const optionBlocks = filter( innerBlocks, ( { name } ) =>
							startsWith( name, 'jetpack/field-option' )
						);

						newInnerBlocks = map( optionBlocks, block =>
							createBlock( 'jetpack/field-option-radio', {
								label: block.attributes.label,
								fieldType: 'radio',
							} )
						);
					} else if ( attributes.options?.length ) {
						newInnerBlocks = map( attributes.options, option =>
							createBlock( 'jetpack/field-option-radio', {
								label: option,
								fieldType: 'radio',
							} )
						);
					}

					return createBlock( 'jetpack/field-radio', attributes, newInnerBlocks );
				},
			},
			{
				type: 'block',
				blocks: [ 'jetpack/field-select' ],
				transform: ( attributes, innerBlocks ) => {
					if ( ! isEmpty( innerBlocks ) ) {
						const optionBlocks = filter( innerBlocks, ( { name } ) =>
							startsWith( name, 'jetpack/field-option' )
						);
						attributes.options = map( optionBlocks, b => b.attributes.label );
					}

					attributes.options = attributes.options?.length ? attributes.options : [ '' ];
					return createBlock( 'jetpack/field-select', attributes );
				},
			},
			{
				type: 'block',
				blocks: [ 'jetpack/field-consent' ],
				transform: attributes => createBlock( 'jetpack/field-consent', attributes ),
			},
			{
				type: 'block',
				blocks: [ 'jetpack/field-checkbox' ],
				transform: attributes => createBlock( 'jetpack/field-checkbox', attributes ),
			},
		],
	},
	save: () => null,
	example: {},
};

const multiFieldV1 = fieldType => ( {
	attributes: {
		...FieldDefaults.attributes,
		label: {
			type: 'string',
			default: fieldType === 'checkbox' ? 'Choose several options' : 'Choose one option',
		},
	},
	migrate: attributes => {
		const blockName = `jetpack/field-option-${ fieldType }`;
		const nonEmptyOptions = filter( attributes.options, o => ! isEmpty( trim( o ) ) );
		const newInnerBlocks = map( nonEmptyOptions, option =>
			createBlock( blockName, {
				label: option,
			} )
		);

		attributes.options = [];

		return [ attributes, newInnerBlocks ];
	},
	isEligible: attr => attr.options && filter( attr.options, o => ! isEmpty( trim( o ) ) ).length,
	save: () => null,
} );

const editField = type => props => {
	useFormWrapper( props );

	return (
		<JetpackField
			clientId={ props.clientId }
			type={ type }
			label={ getFieldLabel( props.attributes, props.name ) }
			required={ props.attributes.required }
			requiredText={ props.attributes.requiredText }
			setAttributes={ props.setAttributes }
			isSelected={ props.isSelected }
			defaultValue={ props.attributes.defaultValue }
			placeholder={ props.attributes.placeholder }
			id={ props.attributes.id }
			width={ props.attributes.width }
			attributes={ props.attributes }
		/>
	);
};

const EditTextarea = props => {
	useFormWrapper( props );

	return (
		<JetpackFieldTextarea
			clientId={ props.clientId }
			label={ props.attributes.label }
			required={ props.attributes.required }
			requiredText={ props.attributes.requiredText }
			attributes={ props.attributes }
			setAttributes={ props.setAttributes }
			isSelected={ props.isSelected }
			defaultValue={ props.attributes.defaultValue }
			placeholder={ props.attributes.placeholder }
			id={ props.attributes.id }
			width={ props.attributes.width }
		/>
	);
};

const EditCheckbox = props => {
	useFormWrapper( props );

	return (
		<JetpackFieldCheckbox
			clientId={ props.clientId }
			label={ props.attributes.label } // label intentionally left blank
			required={ props.attributes.required }
			requiredText={ props.attributes.requiredText }
			setAttributes={ props.setAttributes }
			isSelected={ props.isSelected }
			defaultValue={ props.attributes.defaultValue }
			id={ props.attributes.id }
			width={ props.attributes.width }
			attributes={ props.attributes }
		/>
	);
};

const EditConsent = ( { attributes, clientId, isSelected, name, setAttributes } ) => {
	useFormWrapper( { attributes, clientId, name } );

	const { id, width, consentType, implicitConsentMessage, explicitConsentMessage } = attributes;
	return (
		<JetpackFieldConsent
			clientId={ clientId }
			id={ id }
			isSelected={ isSelected }
			width={ width }
			consentType={ consentType }
			implicitConsentMessage={ implicitConsentMessage }
			explicitConsentMessage={ explicitConsentMessage }
			setAttributes={ setAttributes }
			attributes={ attributes }
		/>
	);
};

export const childBlocks = [
	{
		name: 'field-text',
		settings: {
			...FieldDefaults,
			title: __( 'Text Input Field', 'jetpack-forms' ),
			description: __( 'Collect short text responses from site visitors.', 'jetpack-forms' ),
			icon: renderMaterialIcon(
				<Path
					fill={ getIconColor() }
					d="M12 7H4V8.5H12V7ZM19.75 17.25V10.75H4.25V17.25H19.75ZM5.75 15.75V12.25H18.25V15.75H5.75Z"
				/>
			),
			edit: editField( 'text' ),
			attributes: {
				...FieldDefaults.attributes,
				label: {
					type: 'string',
					default: 'Text',
				},
			},
		},
	},
	{
		name: 'field-name',
		settings: {
			...FieldDefaults,
			title: __( 'Name Field', 'jetpack-forms' ),
			description: __( 'Collect the site visitor’s name.', 'jetpack-forms' ),
			icon: renderMaterialIcon(
				<Path
					fill={ getIconColor() }
					d="M8.25 11.5C9.63071 11.5 10.75 10.3807 10.75 9C10.75 7.61929 9.63071 6.5 8.25 6.5C6.86929 6.5 5.75 7.61929 5.75 9C5.75 10.3807 6.86929 11.5 8.25 11.5ZM8.25 10C8.80228 10 9.25 9.55228 9.25 9C9.25 8.44772 8.80228 8 8.25 8C7.69772 8 7.25 8.44772 7.25 9C7.25 9.55228 7.69772 10 8.25 10ZM13 15.5V17.5H11.5V15.5C11.5 14.8096 10.9404 14.25 10.25 14.25H6.25C5.55964 14.25 5 14.8096 5 15.5V17.5H3.5V15.5C3.5 13.9812 4.73122 12.75 6.25 12.75H10.25C11.7688 12.75 13 13.9812 13 15.5ZM20.5 11H14.5V9.5H20.5V11ZM20.5 14.5H14.5V13H20.5V14.5Z"
				/>
			),
			edit: editField( 'text' ),
			attributes: {
				...FieldDefaults.attributes,
				label: {
					type: 'string',
					default: 'Name',
				},
			},
		},
	},
	{
		name: 'field-email',
		settings: {
			...FieldDefaults,
			title: __( 'Email Field', 'jetpack-forms' ),
			keywords: [ __( 'e-mail', 'jetpack-forms' ), __( 'mail', 'jetpack-forms' ), 'email' ],
			description: __( 'Collect email addresses from your visitors.', 'jetpack-forms' ),
			icon: renderMaterialIcon(
				<Path
					fill={ getIconColor() }
					fillRule="evenodd"
					d="M5.5 8.41665V16C5.5 16.2761 5.72386 16.5 6 16.5H18C18.2761 16.5 18.5 16.2761 18.5 16V8.41633L11.9998 13.9879L5.5 8.41665ZM17.2642 7.5H6.73546L11.9998 12.0123L17.2642 7.5ZM6 6C4.89543 6 4 6.89543 4 8V16C4 17.1046 4.89543 18 6 18H18C19.1046 18 20 17.1046 20 16V8C20 6.89543 19.1046 6 18 6H6Z"
				/>
			),
			edit: editField( 'email' ),
			attributes: {
				...FieldDefaults.attributes,
				label: {
					type: 'string',
					default: 'Email',
				},
			},
		},
	},
	{
		name: 'field-url',
		settings: {
			...FieldDefaults,
			title: __( 'URL Field', 'jetpack-forms' ),
			keywords: [ 'url', __( 'internet page', 'jetpack-forms' ), 'link' ],
			description: __( 'Collect a website address from your site visitors.', 'jetpack-forms' ),
			icon: renderMaterialIcon(
				<>
					<Path
						fill={ getIconColor() }
						d="M4.47118 8.5H3V12.9489C3 14.4653 4.14479 15.5 5.94723 15.5C7.74479 15.5 8.88958 14.4653 8.88958 12.9489V8.5H7.4184V12.8059C7.4184 13.688 6.88742 14.265 5.94723 14.265C5.00216 14.265 4.47118 13.688 4.47118 12.8059V8.5Z"
					/>
					<Path
						fill={ getIconColor() }
						d="M11.5348 9.62534H12.7867C13.5175 9.62534 13.9754 10.0545 13.9754 10.7221C13.9754 11.404 13.5418 11.8188 12.8014 11.8188H11.5348V9.62534ZM11.5348 12.8631H12.7137L14.0241 15.3808H15.6901L14.2092 12.6485C15.0179 12.3386 15.4855 11.5756 15.4855 10.6935C15.4855 9.33447 14.5599 8.5 12.9426 8.5H10.0636V15.3808H11.5348V12.8631Z"
					/>
					<Path fill={ getIconColor() } d="M21 14.1887H17.9261V8.5H16.4549V15.3808H21V14.1887Z" />
				</>
			),
			edit: editField( 'url' ),
			attributes: {
				...FieldDefaults.attributes,
				label: {
					type: 'string',
					default: 'URL',
				},
			},
		},
	},
	{
		name: 'field-date',
		settings: {
			...FieldDefaults,
			title: __( 'Date Picker', 'jetpack-forms' ),
			keywords: [
				__( 'Calendar', 'jetpack-forms' ),
				_x( 'day month year', 'block search term', 'jetpack-forms' ),
			],
			description: __( 'Capture date information with a date picker.', 'jetpack-forms' ),
			icon: renderMaterialIcon(
				<Path
					fill={ getIconColor() }
					fillRule="evenodd"
					d="M4.5 7H19.5V19C19.5 19.2761 19.2761 19.5 19 19.5H5C4.72386 19.5 4.5 19.2761 4.5 19V7ZM3 5V7V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V7V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5ZM11 9.25H7V13.25H11V9.25Z"
				/>
			),
			edit: JetpackDatePicker,
			attributes: {
				...FieldDefaults.attributes,
				label: {
					type: 'string',
					default: 'Date',
				},
				dateFormat: {
					type: 'string',
					default: 'yy-mm-dd',
				},
			},
		},
	},
	{
		name: 'field-telephone',
		settings: {
			...FieldDefaults,
			title: __( 'Phone Number Field', 'jetpack-forms' ),
			keywords: [
				__( 'Phone', 'jetpack-forms' ),
				__( 'Cellular phone', 'jetpack-forms' ),
				__( 'Mobile', 'jetpack-forms' ),
			],
			description: __( 'Collect phone numbers from site visitors.', 'jetpack-forms' ),
			icon: renderMaterialIcon(
				<Path
					fill={ getIconColor() }
					fillRule="evenodd"
					d="M9 5.5H15C15.2761 5.5 15.5 5.72386 15.5 6V18C15.5 18.2761 15.2761 18.5 15 18.5H9C8.72386 18.5 8.5 18.2761 8.5 18V6C8.5 5.72386 8.72386 5.5 9 5.5ZM7 6C7 4.89543 7.89543 4 9 4H15C16.1046 4 17 4.89543 17 6V18C17 19.1046 16.1046 20 15 20H9C7.89543 20 7 19.1046 7 18V6ZM13 16H11V17.5H13V16Z"
				/>
			),
			edit: editField( 'tel' ),
			attributes: {
				...FieldDefaults.attributes,
				label: {
					type: 'string',
					default: 'Phone',
				},
			},
		},
	},
	{
		name: 'field-textarea',
		settings: {
			...FieldDefaults,
			title: __( 'Multi-line Text Field', 'jetpack-forms' ),
			keywords: [
				__( 'Textarea', 'jetpack-forms' ),
				'textarea',
				__( 'Multiline text', 'jetpack-forms' ),
			],
			description: __( 'Capture longform text responses from site visitors.', 'jetpack-forms' ),
			icon: renderMaterialIcon(
				<Path
					fill={ getIconColor() }
					d="M20 5H4V6.5H20V5ZM5.5 11.5H18.5V18.5H5.5V11.5ZM20 20V10H4V20H20Z"
				/>
			),
			edit: EditTextarea,
			attributes: {
				...FieldDefaults.attributes,
			},
		},
	},
	{
		name: 'field-checkbox',
		settings: {
			...FieldDefaults,
			title: __( 'Checkbox', 'jetpack-forms' ),
			keywords: [ __( 'Confirm', 'jetpack-forms' ), __( 'Accept', 'jetpack-forms' ) ],
			description: __( 'Confirm or select information with a single checkbox.', 'jetpack-forms' ),
			icon: renderMaterialIcon(
				<Path
					fill={ getIconColor() }
					fillRule="evenodd"
					d="M6.125 6H17.875C17.944 6 18 6.05596 18 6.125V17.875C18 17.944 17.944 18 17.875 18H6.125C6.05596 18 6 17.944 6 17.875V6.125C6 6.05596 6.05596 6 6.125 6ZM4.5 6.125C4.5 5.22754 5.22754 4.5 6.125 4.5H17.875C18.7725 4.5 19.5 5.22754 19.5 6.125V17.875C19.5 18.7725 18.7725 19.5 17.875 19.5H6.125C5.22754 19.5 4.5 18.7725 4.5 17.875V6.125ZM10.5171 16.4421L16.5897 8.71335L15.4103 7.78662L10.4828 14.0579L8.57616 11.7698L7.42383 12.7301L10.5171 16.4421Z"
				/>
			),
			edit: EditCheckbox,
			attributes: {
				...FieldDefaults.attributes,
				label: {
					type: 'string',
					default: '',
				},
			},
		},
	},
	{
		name: 'field-consent',
		settings: {
			...FieldDefaults,
			title: __( 'Terms Consent', 'jetpack-forms' ),
			keywords: [ __( 'Consent', 'jetpack-forms' ) ],
			description: __(
				'Communicate site terms and offer visitors consent to those terms.',
				'jetpack-forms'
			),
			icon: renderMaterialIcon(
				<>
					<Path
						fill={ getIconColor() }
						d="M7 5.5H17C17.2761 5.5 17.5 5.72386 17.5 6V13H19V6C19 4.89543 18.1046 4 17 4H7C5.89543 4 5 4.89543 5 6V18C5 19.1046 5.89543 20 7 20H11.5V18.5H7C6.72386 18.5 6.5 18.2761 6.5 18V6C6.5 5.72386 6.72386 5.5 7 5.5ZM16 7.75H8V9.25H16V7.75ZM8 11H13V12.5H8V11Z"
					/>
					<Path
						fill={ getIconColor() }
						d="M20.1087 15.9382L15.9826 21.6689L12.959 18.5194L14.0411 17.4806L15.8175 19.331L18.8914 15.0618L20.1087 15.9382Z"
					/>
				</>
			),
			attributes: {
				...FieldDefaults.attributes,
				label: {
					type: 'string',
					default: __( 'Consent', 'jetpack-forms' ),
				},
				consentType: {
					type: 'string',
					default: 'implicit',
				},
				implicitConsentMessage: {
					type: 'string',
					default: __(
						"By submitting your information, you're giving us permission to email you. You may unsubscribe at any time.",
						'jetpack-forms'
					),
				},
				explicitConsentMessage: {
					type: 'string',
					default: __( 'Can we send you an email from time to time?', 'jetpack-forms' ),
				},
			},
			edit: EditConsent,
		},
	},
	{
		name: JetpackFieldSingleChoice.name,
		settings: mergeSettings( FieldDefaults, {
			...JetpackFieldSingleChoice.settings,
			deprecated: [ multiFieldV1( 'radio' ) ],
		} ),
	},
	JetpackFieldSingleChoiceItem,
	{
		name: JetpackFieldMultipleChoice.name,
		settings: mergeSettings( FieldDefaults, {
			...JetpackFieldMultipleChoice.settings,
			deprecated: [ multiFieldV1( 'checkbox' ) ],
		} ),
	},
	JetpackFieldMultipleChoiceItem,
	{
		name: 'field-select',
		settings: {
			...FieldDefaults,
			title: __( 'Dropdown Field', 'jetpack-forms' ),
			keywords: [
				__( 'Choose', 'jetpack-forms' ),
				__( 'Dropdown', 'jetpack-forms' ),
				__( 'Option', 'jetpack-forms' ),
			],
			description: __(
				'Add a compact select box, that when expanded, allows visitors to choose one value from the list.',
				'jetpack-forms'
			),
			icon: renderMaterialIcon(
				<Path
					fill={ getIconColor() }
					d="M5 4.5H19C19.2761 4.5 19.5 4.72386 19.5 5V19C19.5 19.2761 19.2761 19.5 19 19.5H5C4.72386 19.5 4.5 19.2761 4.5 19V5C4.5 4.72386 4.72386 4.5 5 4.5ZM19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3ZM8.93582 10.1396L8.06396 11.3602L11.9999 14.1716L15.9358 11.3602L15.064 10.1396L11.9999 12.3283L8.93582 10.1396Z"
				/>
			),
			edit: JetpackDropdown,
			attributes: {
				...FieldDefaults.attributes,
				toggleLabel: {
					type: 'string',
					default: null,
				},
				options: {
					type: 'array',
					default: [ '' ],
				},
			},
		},
	},
];
