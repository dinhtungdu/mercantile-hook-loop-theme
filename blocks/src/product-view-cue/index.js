import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, RichText } from '@wordpress/block-editor';
import metadata from './block.json';
import './style.css';

registerBlockType( metadata.name, {
	edit( { attributes, setAttributes } ) {
		const blockProps = useBlockProps( { className: 'mh-cell__view' } );
		return (
			<RichText
				{ ...blockProps }
				tagName="span"
				value={ attributes.text }
				onChange={ ( text ) => setAttributes( { text } ) }
				placeholder={ __( 'view →', 'mercantile-hook-loop' ) }
				allowedFormats={ [] }
				disableLineBreaks
			/>
		);
	},
	save: () => null,
} );
