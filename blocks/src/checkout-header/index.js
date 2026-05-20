import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import metadata from './block.json';

function Edit() {
	const blockProps = useBlockProps( {
		className: 'checkout-head',
	} );

	return (
		<section
			{ ...blockProps }
			aria-label={ __( 'Checkout progress', 'mercantile-hook-loop' ) }
		>
			<div className="ckhead">
				<div className="crumb">
					<span>← { __( 'shop', 'mercantile-hook-loop' ) }</span>
					<b>/</b>
					{ __( 'checkout', 'mercantile-hook-loop' ) }
				</div>
				<div className="meta">
					<span>
						{ __( 'SSL', 'mercantile-hook-loop' ) } ·{ ' ' }
						<b>{ __( 'secure', 'mercantile-hook-loop' ) }</b>
					</span>
					<span>
						{ __( 'est. ship', 'mercantile-hook-loop' ) } ·{ ' ' }
						<b>
							{ __(
								'1–2 business days',
								'mercantile-hook-loop'
							) }
						</b>
					</span>
				</div>
			</div>
			<div className="step-nav">
				<a
					className="step done"
					href="/cart/"
					onClick={ ( event ) => event.preventDefault() }
				>
					<span className="n">01</span>
					<span>{ __( 'cart', 'mercantile-hook-loop' ) }</span>
				</a>
				<div className="step now">
					<span className="n">02</span>
					<span>{ __( 'details', 'mercantile-hook-loop' ) }</span>
				</div>
				<div className="step">
					<span className="n">03</span>
					<span>{ __( 'confirm', 'mercantile-hook-loop' ) }</span>
				</div>
			</div>
		</section>
	);
}

registerBlockType( metadata.name, {
	edit: Edit,
	save: () => null,
} );
