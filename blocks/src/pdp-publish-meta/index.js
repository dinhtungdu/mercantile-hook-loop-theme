import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import metadata from './block.json';
import './style.css';

/**
 * Static editor preview. The real status / visibility / stock values
 * are server-rendered from the current product in render.php; the Site
 * Editor has no product context, so edit() shows the shape with
 * representative placeholder values.
 */
registerBlockType( metadata.name, {
	edit: function Edit() {
		const blockProps = useBlockProps( { className: 'mh-pdp__panel' } );

		return (
			<section { ...blockProps }>
				<div className="mh-status-row">
					<span>status</span>
					<span className="v g">&bull; published</span>
				</div>
				<div className="mh-status-row">
					<span>visibility</span>
					<span className="v">public</span>
				</div>
				<div className="mh-status-row">
					<span>stock</span>
					<span className="v">
						<b>in stock</b>
					</span>
				</div>
			</section>
		);
	},
	save: () => null,
} );
