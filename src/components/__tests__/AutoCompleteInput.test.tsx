import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AutoCompleteInput } from '../form/AutoCompleteInput';

const mockOptions = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3' },
];

describe('AutoCompleteInput', () => {
  const mockOnChange = jest.fn();
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render input with placeholder', () => {
    render(
      <AutoCompleteInput
        value=""
        onChange={mockOnChange}
        options={mockOptions}
        placeholder="Search..."
      />
    );

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('should display current value', () => {
    render(
      <AutoCompleteInput
        value="Option 1"
        onChange={mockOnChange}
        options={mockOptions}
      />
    );

    const input = screen.getByDisplayValue('Option 1');
    expect(input).toBeInTheDocument();
  });

  it('should call onChange when input value changes', () => {
    render(
      <AutoCompleteInput
        value=""
        onChange={mockOnChange}
        options={mockOptions}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'test' } });

    expect(mockOnChange).toHaveBeenCalledWith('test');
  });

  it('should filter options based on input', async () => {
    render(
      <AutoCompleteInput
        value=""
        onChange={mockOnChange}
        options={mockOptions}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.click(input);
    
    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    fireEvent.change(input, { target: { value: 'Option 1' } });

    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
    });
  });

  it('should call onSelect when option is selected', async () => {
    render(
      <AutoCompleteInput
        value=""
        onChange={mockOnChange}
        options={mockOptions}
        onSelect={mockOnSelect}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.click(input);

    await waitFor(() => {
      const option = screen.getByText('Option 1');
      fireEvent.click(option);
    });

    expect(mockOnSelect).toHaveBeenCalledWith(mockOptions[0]);
  });

  it('should use custom filter function when provided', async () => {
    const customFilter = jest.fn((option, query) => option.label.includes(query));

    render(
      <AutoCompleteInput
        value=""
        onChange={mockOnChange}
        options={mockOptions}
        filterFn={customFilter}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.click(input);
    fireEvent.change(input, { target: { value: '1' } });

    await waitFor(() => {
      expect(customFilter).toHaveBeenCalled();
    });
  });

  it('should handle empty options', () => {
    render(
      <AutoCompleteInput
        value=""
        onChange={mockOnChange}
        options={[]}
      />
    );

    const input = screen.getByRole('combobox');
    expect(input).toBeInTheDocument();
  });
});
