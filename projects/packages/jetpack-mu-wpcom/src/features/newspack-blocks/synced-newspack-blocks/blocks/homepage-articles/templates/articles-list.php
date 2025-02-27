<?php
/**
 * Article list template.
 *
 * @global WP_Query $article_query Article query.
 * @global array    $attributes
 * @package WordPress
 */

call_user_func(
	function ( $data ) {
		echo Newspack_Blocks::template_inc( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			__DIR__ . '/articles-loop.php',
			array(
				'attributes'    => $data['attributes'], // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				'article_query' => $data['article_query'], // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			)
		);
	},
	$data // phpcs:ignore VariableAnalysis.CodeAnalysis.VariableAnalysis.UndefinedVariable
);
