import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import metadata from './block.json';
import './style.css';

/**
 * Static editor preview. The real price / category / tags / attribute
 * rows are server-rendered from the current product in render.php; the
 * Site Editor has no product context, so edit() shows the shape with
 * representative placeholder values.
 */
registerBlockType( metadata.name, {
	edit() {
		const blockProps = useBlockProps( { className: 'mh-pdp__details' } );

		const rows = [
			{ key: __( 'price', 'mercantile-hook-loop' ), value: '$48.00' },
			{ key: __( 'category', 'mercantile-hook-loop' ), value: 'Apparel' },
			{ key: __( 'tags', 'mercantile-hook-loop' ), value: '#new #wapuu' },
			{ key: 'material', value: 'Cotton' },
		];

		return (
			<div { ...blockProps }>
				{ rows.map( ( row ) => (
					<div className="mh-pdp__spec-row" key={ row.key }>
						<span className="mh-pdp__spec-key">{ row.key }</span>
						<span className="mh-pdp__spec-val">{ row.value }</span>
					</div>
				) ) }
			</div>
		);
	},
	save: () => null,
} );
