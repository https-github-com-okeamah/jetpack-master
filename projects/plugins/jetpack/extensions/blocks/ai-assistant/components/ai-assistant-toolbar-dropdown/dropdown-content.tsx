/*
 * External dependencies
 */
import { aiAssistantIcon } from '@automattic/jetpack-ai-client';
import { MenuItem, MenuGroup, Notice } from '@wordpress/components';
import { select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { post, postContent, postExcerpt, termDescription, blockTable } from '@wordpress/icons';
import React from 'react';
/**
 * Internal dependencies
 */
import { EXTENDED_BLOCKS } from '../../extensions/constants';
import {
	PROMPT_TYPE_CHANGE_TONE,
	PROMPT_TYPE_CORRECT_SPELLING,
	PROMPT_TYPE_MAKE_LONGER,
	PROMPT_TYPE_MAKE_SHORTER,
	PROMPT_TYPE_SIMPLIFY,
	PROMPT_TYPE_SUMMARIZE,
	PROMPT_TYPE_CHANGE_LANGUAGE,
	PROMPT_TYPE_USER_PROMPT,
	PROMPT_TYPE_TRANSFORM_LIST_TO_TABLE,
} from '../../lib/prompt';
import { capitalize } from '../../lib/utils/capitalize';
import { I18nMenuDropdown, TRANSLATE_LABEL } from '../i18n-dropdown-control';
import { TONE_LABEL, ToneDropdownMenu } from '../tone-dropdown-control';
import './style.scss';
/**
 * Types and constants
 */
import type { ExtendedBlockProp } from '../../extensions/constants';
import type { PromptTypeProp } from '../../lib/prompt';
import type { ToneProp } from '../tone-dropdown-control';
import type { ReactElement } from 'react';

// Quick edits option: "Correct spelling and grammar"
export const QUICK_EDIT_KEY_CORRECT_SPELLING = 'correct-spelling' as const;

// Quick edits option: "Simplify"
export const QUICK_EDIT_KEY_SIMPLIFY = 'simplify' as const;

// Quick edits option: "Summarize"
export const QUICK_EDIT_KEY_SUMMARIZE = 'summarize' as const;

// Quick edits option: "Make longer"
export const QUICK_EDIT_KEY_MAKE_LONGER = 'make-longer' as const;

// Quick edits option: "Make longer"
export const QUICK_EDIT_KEY_MAKE_SHORTER = 'make-shorter' as const;

// Ask AI Assistant option
export const KEY_ASK_AI_ASSISTANT = 'ask-ai-assistant' as const;

const quickActionsList: {
	[ key: string ]: {
		name: string;
		key: string;
		aiSuggestion: PromptTypeProp;
		icon: ReactElement;
		options?: AiAssistantDropdownOnChangeOptionsArgProps;
	}[];
} = {
	default: [
		{
			name: __( 'Correct spelling and grammar', 'jetpack' ),
			key: QUICK_EDIT_KEY_CORRECT_SPELLING,
			aiSuggestion: PROMPT_TYPE_CORRECT_SPELLING,
			icon: termDescription,
		},
	],
	'core/paragraph': [
		{
			name: __( 'Simplify', 'jetpack' ),
			key: QUICK_EDIT_KEY_SIMPLIFY,
			aiSuggestion: PROMPT_TYPE_SIMPLIFY,
			icon: post,
		},
		{
			name: __( 'Summarize', 'jetpack' ),
			key: QUICK_EDIT_KEY_SUMMARIZE,
			aiSuggestion: PROMPT_TYPE_SUMMARIZE,
			icon: postExcerpt,
		},
		{
			name: __( 'Expand', 'jetpack' ),
			key: QUICK_EDIT_KEY_MAKE_LONGER,
			aiSuggestion: PROMPT_TYPE_MAKE_LONGER,
			icon: postContent,
		},
		{
			name: __( 'Make shorter', 'jetpack' ),
			key: QUICK_EDIT_KEY_MAKE_SHORTER,
			aiSuggestion: PROMPT_TYPE_MAKE_SHORTER,
			icon: postContent,
		},
	],
	'core/list-item': [
		{
			name: __( 'Simplify', 'jetpack' ),
			key: QUICK_EDIT_KEY_SIMPLIFY,
			aiSuggestion: PROMPT_TYPE_SIMPLIFY,
			icon: post,
		},
		{
			name: __( 'Expand', 'jetpack' ),
			key: QUICK_EDIT_KEY_MAKE_LONGER,
			aiSuggestion: PROMPT_TYPE_MAKE_LONGER,
			icon: postContent,
		},
		{
			name: __( 'Make shorter', 'jetpack' ),
			key: QUICK_EDIT_KEY_MAKE_SHORTER,
			aiSuggestion: PROMPT_TYPE_MAKE_SHORTER,
			icon: postContent,
		},
	],
	'core/list': EXTENDED_BLOCKS.includes( 'core/list' )
		? [
				{
					name: __( 'Simplify', 'jetpack' ),
					key: QUICK_EDIT_KEY_SIMPLIFY,
					aiSuggestion: PROMPT_TYPE_SIMPLIFY,
					icon: post,
				},
				{
					name: __( 'Expand', 'jetpack' ),
					key: QUICK_EDIT_KEY_MAKE_LONGER,
					aiSuggestion: PROMPT_TYPE_MAKE_LONGER,
					icon: postContent,
				},
				{
					name: __( 'Make shorter', 'jetpack' ),
					key: QUICK_EDIT_KEY_MAKE_SHORTER,
					aiSuggestion: PROMPT_TYPE_MAKE_SHORTER,
					icon: postContent,
				},
				{
					name: __( 'Turn list into a table', 'jetpack' ),
					key: 'turn-into-table',
					aiSuggestion: PROMPT_TYPE_TRANSFORM_LIST_TO_TABLE,
					icon: blockTable,
					options: {
						alwaysTransformToAIAssistant: true,
						rootParentOnly: true,
					},
				},
		  ]
		: [
				// Those actions are transformative in nature and are better suited for the AI Assistant block.
				// TODO: Keep the action, but transforming the block.
				{
					name: __( 'Write a post from this list', 'jetpack' ),
					key: 'write-post-from-list',
					aiSuggestion: PROMPT_TYPE_USER_PROMPT,
					icon: post,
					options: {
						userPrompt:
							'Write a post based on the list items. Include a title as first order heading and try to use secondary headings for each entry',
					},
				},
		  ],
};

export type AiAssistantDropdownOnChangeOptionsArgProps = {
	tone?: ToneProp;
	language?: string;
	userPrompt?: string;
	alwaysTransformToAIAssistant?: boolean;
	rootParentOnly?: boolean;
};

export type OnRequestSuggestion = (
	promptType: PromptTypeProp,
	options?: AiAssistantDropdownOnChangeOptionsArgProps,
	humanText?: string
) => void;

type AiAssistantToolbarDropdownContentProps = {
	blockType: ExtendedBlockProp;
	disabled?: boolean;
	onAskAiAssistant: () => void;
	onRequestSuggestion: OnRequestSuggestion;
	clientId: string;
};

/**
 * The React UI content of the dropdown.
 * @param {AiAssistantToolbarDropdownContentProps} props - The props.
 * @return {ReactElement} The React content of the dropdown.
 */
export default function AiAssistantToolbarDropdownContent( {
	blockType,
	clientId,
	disabled = false,
	onAskAiAssistant,
	onRequestSuggestion,
}: AiAssistantToolbarDropdownContentProps ): ReactElement {
	const blockQuickActions = quickActionsList[ blockType ] ?? [];

	const { getBlockParents } = select( 'core/block-editor' ) as unknown as {
		getBlockParents: ( blockId: string ) => string[];
	};
	const blockParents = getBlockParents( clientId );

	return (
		<>
			{ disabled && (
				<Notice status="warning" isDismissible={ false } className="jetpack-ai-assistant__info">
					{ __( 'Add content to activate the tools below', 'jetpack' ) }
				</Notice>
			) }

			<MenuGroup>
				<MenuItem
					icon={ aiAssistantIcon }
					iconPosition="left"
					key="key-ai-assistant"
					onClick={ onAskAiAssistant }
					disabled={ disabled }
				>
					<div className="jetpack-ai-assistant__menu-item">
						{ __( 'Ask AI Assistant', 'jetpack' ) }
					</div>
				</MenuItem>

				{ [ ...quickActionsList.default, ...blockQuickActions ]
					.filter(
						quickAction => ! ( quickAction.options?.rootParentOnly && blockParents.length > 0 )
					)
					.map( quickAction => {
						return (
							<MenuItem
								icon={ quickAction?.icon }
								iconPosition="left"
								key={ `key-${ quickAction.key }` }
								onClick={ () => {
									onRequestSuggestion(
										quickAction.aiSuggestion,
										{ ...( quickAction.options ?? {} ) },
										quickAction.name
									);
								} }
								disabled={ disabled }
							>
								<div className="jetpack-ai-assistant__menu-item">{ quickAction.name }</div>
							</MenuItem>
						);
					} ) }

				<ToneDropdownMenu
					onChange={ tone => {
						onRequestSuggestion(
							PROMPT_TYPE_CHANGE_TONE,
							{ tone },
							`${ TONE_LABEL }: ${ capitalize( tone ) }`
						);
					} }
					disabled={ disabled }
				/>

				<I18nMenuDropdown
					onChange={ ( language, name ) => {
						onRequestSuggestion(
							PROMPT_TYPE_CHANGE_LANGUAGE,
							{ language },
							`${ TRANSLATE_LABEL }: ${ name }`
						);
					} }
					disabled={ disabled }
				/>
			</MenuGroup>
		</>
	);
}
