const Skeleton = ({ width, height, variant = 'text', style = {} }) => {
    const baseStyle = {
        width: width || '100%',
        height: height || (variant === 'text' ? '1rem' : '100%'),
        ...style
    };

    let className = 'skeleton';
    if (variant === 'text') className += ' skeleton-text';
    if (variant === 'title') className += ' skeleton-title';
    if (variant === 'circle') className += ' skeleton-circle';

    return <div className={className} style={baseStyle}></div>;
};

export default Skeleton;
