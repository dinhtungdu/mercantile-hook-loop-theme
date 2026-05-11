import { registerBlockType } from '@wordpress/blocks';
import {
	useBlockProps,
	useInnerBlocksProps,
	InnerBlocks,
} from '@wordpress/block-editor';
import metadata from './block.json';

const ITEM = 'core/paragraph';
const ALLOWED = [ ITEM ];

// Default ticker scaffold inserted on first drop. Each item is an
// editable paragraph in the canvas — no opaque ServerSideRender preview.
const TEMPLATE = [
	[
		ITEM,
		{
			className: 'mh-ticker__item',
			content: '<strong>Hooked.</strong> 12,847 actions fired today',
		},
	],
	[
		ITEM,
		{
			className: 'mh-ticker__item is-wapuu',
			content:
				'the tie-dye hoodie is my favorite (don’t tell the others).',
		},
	],
	[
		ITEM,
		{
			className: 'mh-ticker__item',
			content:
				'<strong>ORDER #10820</strong> · tie-dye-hoodie × 1 → Portland, OR',
		},
	],
	[
		ITEM,
		{
			className: 'mh-ticker__item',
			content: 'Code is poetry. Merch is proof.',
		},
	],
	[
		ITEM,
		{
			className: 'mh-ticker__item is-wapuu',
			content: 'don’t worry, press happy.',
		},
	],
	[
		ITEM,
		{
			className: 'mh-ticker__item',
			content:
				'<span class="mh-mono-blue">[mercantile id="i-love-wp-tee"]</span> → renders in 38ms',
		},
	],
	[
		ITEM,
		{
			className: 'mh-ticker__item is-wapuu',
			content: 'Howdy.',
		},
	],
	[
		ITEM,
		{
			className: 'mh-ticker__item',
			content:
				'Howdy is the original wp-admin greeting · since 2008',
		},
	],
	[
		ITEM,
		{
			className: 'mh-ticker__item',
			content:
				'<span class="mh-mono-blue">$ ssh shop@mercantile.wordpress.org</span>',
		},
	],
];

registerBlockType( metadata.name, {
	edit() {
		const blockProps = useBlockProps( {
			className: 'mh-ticker__rail is-editor-preview',
		} );
		const innerProps = useInnerBlocksProps(
			{ className: 'mh-ticker__track' },
			{
				allowedBlocks: ALLOWED,
				template: TEMPLATE,
				orientation: 'horizontal',
				templateLock: false,
			}
		);
		return (
			<div { ...blockProps }>
				<div { ...innerProps } />
			</div>
		);
	},
	save: () => <InnerBlocks.Content />,
} );
